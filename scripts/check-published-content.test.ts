import { describe, expect, test, vi } from 'vitest'
import {
  checkPublishedContent,
  contentDigest,
  fetchBuildContent,
} from './check-published-content.mjs'

const documents = [
  { _id: 'siteSettings', _rev: 'settings-1' },
  { _id: 'service-painting', _rev: 'painting-1' },
]
const fetchResult = (result: unknown) => vi.fn(async () => Response.json({ result }))

describe('published Sanity content polling', () => {
  test('records the actual build when content is published and then unpublished around deployment', async () => {
    const duringBuild = [...documents, { _id: 'temporary-post', _rev: 'temporary-1' }]
    const client = {
      fetch: async () => ({ snapshot: { posts: ['temporary-post'] }, revisions: duringBuild }),
    }
    const built = await fetchBuildContent(client, '{"posts": *[_type == "post"]}')

    expect(built.snapshot).toEqual({ posts: ['temporary-post'] })
    expect(built.digest).toBe(contentDigest(duringBuild))
    await expect(
      checkPublishedContent({ previousDigest: built.digest, fetcher: fetchResult(documents) }),
    ).resolves.toMatchObject({ changed: true })
  })

  test('a build without a coherent revision list cannot record a successful content state', async () => {
    await expect(
      fetchBuildContent({ fetch: async () => ({ snapshot: {} }) }, '{}'),
    ).rejects.toThrow('Sanity result must be an array')
  })

  test('hashing is independent of result order, property order, and unused metadata', () => {
    expect(
      contentDigest([
        { _rev: 'painting-1', _id: 'service-painting', title: 'Ignored by the revision check' },
        { _rev: 'settings-1', _id: 'siteSettings' },
      ]),
    ).toBe(contentDigest(documents))
  })

  test('draft and unpublished release changes do not affect the digest', () => {
    expect(
      contentDigest([
        ...documents,
        { _id: 'drafts.service-painting', _rev: 'draft-edited' },
        { _id: 'versions.release-one.service-painting', _rev: 'release-edited' },
      ]),
    ).toBe(contentDigest(documents))
  })

  test('requests the published perspective with explicit draft and release boundaries', async () => {
    const fetcher = fetchResult(documents)
    await checkPublishedContent({ fetcher })
    const [url, options] = fetcher.mock.calls[0] as unknown as [URL, RequestInit]

    expect(url.origin).toBe('https://ki7bs4vk.api.sanity.io')
    expect(url.pathname).toBe('/v2026-08-13/data/query/production')
    expect(url.searchParams.get('perspective')).toBe('published')
    expect(url.searchParams.get('query')).toContain('!(_id in path("drafts.**"))')
    expect(url.searchParams.get('query')).toContain('!(_id in path("versions.**"))')
    expect(url.searchParams.get('query')).toContain('"sanity.imageAsset"')
    expect(options.headers).toEqual({ Accept: 'application/json' })
    expect(options.signal).toBeInstanceOf(AbortSignal)
  })

  test('unchanged published revisions skip deployment', async () => {
    await expect(
      checkPublishedContent({
        previousDigest: `${contentDigest(documents)}\n`,
        fetcher: fetchResult(documents),
      }),
    ).resolves.toEqual({ digest: contentDigest(documents), changed: false })
  })

  test.each([
    ['a published edit', [documents[0], { ...documents[1], _rev: 'painting-2' }]],
    ['a deletion or unpublish', [documents[0]]],
    ['a newly published document', [...documents, { _id: 'new-post', _rev: 'post-1' }]],
    ['removing all published documents', []],
  ])('%s triggers deployment', async (_description, changedDocuments) => {
    await expect(
      checkPublishedContent({
        previousDigest: contentDigest(documents),
        fetcher: fetchResult(changedDocuments),
      }),
    ).resolves.toMatchObject({ changed: true })
  })

  test('a missing saved digest triggers the initial deployment', async () => {
    await expect(checkPublishedContent({ fetcher: fetchResult(documents) })).resolves.toMatchObject(
      {
        changed: true,
      },
    )
  })

  test('reverting content is compared with the latest deployment rather than any historical digest', async () => {
    const changedDocuments = [documents[0], { ...documents[1], _rev: 'painting-2' }]
    await expect(
      checkPublishedContent({
        previousDigest: contentDigest(changedDocuments),
        fetcher: fetchResult(documents),
      }),
    ).resolves.toMatchObject({ digest: contentDigest(documents), changed: true })
  })

  test('HTTP failures fail the check instead of reporting unchanged content', async () => {
    await expect(
      checkPublishedContent({ fetcher: async () => new Response('Unavailable', { status: 503 }) }),
    ).rejects.toThrow('HTTP 503')
  })

  test('network failures fail the check instead of reporting unchanged content', async () => {
    await expect(
      checkPublishedContent({
        fetcher: async () => {
          throw new Error('Connection failed')
        },
      }),
    ).rejects.toThrow('Connection failed')
  })

  test.each([undefined, {}, [{ _id: 'siteSettings' }], [null], [...documents, documents[0]]])(
    'invalid API results fail the check',
    async (result) => {
      await expect(checkPublishedContent({ fetcher: fetchResult(result) })).rejects.toThrow()
    },
  )
})
