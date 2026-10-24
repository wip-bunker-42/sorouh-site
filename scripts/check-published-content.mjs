import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Keep these document types aligned with web/src/sanity/queries.ts.
const contentTypes = [
  'siteSettings',
  'homePage',
  'aboutPage',
  'contactPage',
  'service',
  'serviceArea',
  'serviceAreaLanding',
  'project',
  'category',
  'post',
  'redirect',
]

export const PUBLISHED_CONTENT_QUERY = `*[
  !(_id in path("drafts.**")) &&
  !(_id in path("versions.**")) &&
  (
    _type in ${JSON.stringify(contentTypes)} ||
    (_type in ["sanity.imageAsset", "sanity.fileAsset"] && count(*[
      _type in ${JSON.stringify(contentTypes)} &&
      !(_id in path("drafts.**")) &&
      !(_id in path("versions.**")) &&
      references(^._id)
    ]) > 0)
  )
] | order(_id asc){_id, _rev}`

export function contentDigest(documents) {
  if (!Array.isArray(documents)) throw new Error('Sanity result must be an array')

  const revisions = []
  const ids = new Set()
  for (const document of documents) {
    if (
      !document ||
      typeof document._id !== 'string' ||
      !document._id ||
      typeof document._rev !== 'string' ||
      !document._rev
    ) {
      throw new Error('Sanity result contains an invalid document revision')
    }
    if (document._id.startsWith('drafts.') || document._id.startsWith('versions.')) continue
    if (ids.has(document._id)) throw new Error('Sanity result contains duplicate document IDs')
    ids.add(document._id)
    revisions.push({ _id: document._id, _rev: document._rev })
  }
  revisions.sort((left, right) => (left._id < right._id ? -1 : left._id > right._id ? 1 : 0))
  return createHash('sha256').update(JSON.stringify(revisions)).digest('hex')
}

export async function fetchBuildContent(client, snapshotQuery) {
  // A single GROQ query binds the revision list to the exact content rendered.
  const result = await client.fetch(
    `{"snapshot": ${snapshotQuery}, "revisions": ${PUBLISHED_CONTENT_QUERY}}`,
  )
  return { snapshot: result?.snapshot, digest: contentDigest(result?.revisions) }
}

export async function checkPublishedContent({ previousDigest = '', fetcher = fetch } = {}) {
  const url = new URL('https://ki7bs4vk.api.sanity.io/v2026-08-13/data/query/production')
  url.searchParams.set('perspective', 'published')
  url.searchParams.set('query', PUBLISHED_CONTENT_QUERY)
  const response = await fetcher(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`Sanity content check failed with HTTP ${response.status}`)

  const payload = await response.json()
  const digest = contentDigest(payload?.result)
  return { digest, changed: digest !== previousDigest.trim() }
}

async function main() {
  const statePath =
    process.env.CONTENT_REVISION_PATH || join(tmpdir(), 'sorouh-content', 'published.sha256')
  let previousDigest = ''
  try {
    previousDigest = await readFile(statePath, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const result = await checkPublishedContent({ previousDigest })
  await mkdir(dirname(statePath), { recursive: true })
  await writeFile(statePath, `${result.digest}\n`)
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `digest=${result.digest}\nchanged=${result.changed}\n`,
    )
  }
  console.log(`Published Sanity content: ${result.changed ? 'changed' : 'unchanged'}.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Published content check failed: ${error.message}`)
    process.exitCode = 1
  })
}
