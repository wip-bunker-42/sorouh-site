import { describe, expect, test, vi } from 'vitest'

import {
  buildRedirectFrom,
  captureSlugAndPublish,
  routeForSlug,
} from '../actions/capture-slug-redirect'

describe('slug redirect helper', () => {
  test('does nothing when the published slug is unchanged', () => {
    expect(
      buildRedirectFrom({
        type: 'service',
        publishedSlug: 'مقاولات-عامة',
        draftSlug: 'مقاولات-عامة',
        redirectFrom: ['/الخدمات/قديم/'],
      }),
    ).toEqual(['/الخدمات/قديم/'])
  })

  test('records the first old slug and keeps one leading and trailing slash', () => {
    expect(
      buildRedirectFrom({
        type: 'project',
        publishedSlug: 'مشروع-قديم',
        draftSlug: 'مشروع-جديد',
      }),
    ).toEqual([routeForSlug('project', 'مشروع-قديم')])
  })

  test('deduplicates an old slug that was already captured', () => {
    const oldPath = routeForSlug('post', 'اختيار-المقاول')
    expect(
      buildRedirectFrom({
        type: 'post',
        publishedSlug: 'اختيار-المقاول',
        draftSlug: 'دليل-اختيار-المقاول',
        redirectFrom: [oldPath, oldPath],
      }),
    ).toEqual([oldPath])
  })

  test('normalizes Arabic slugs without double encoding', () => {
    const plain = routeForSlug('serviceArea', 'رأس-تنورة')
    const encoded = routeForSlug('serviceArea', encodeURIComponent('رأس-تنورة'))
    expect(encoded).toBe(plain)
    expect(decodeURI(plain)).toBe('/مناطق-الخدمة/رأس-تنورة/')
  })

  test.each([
    ['service', 'مقاولات-عامة', '/الخدمات/مقاولات-عامة/'],
    ['serviceArea', 'الدمام', '/مناطق-الخدمة/الدمام/'],
    ['project', 'ترميم-فيلا', '/مشاريعنا/ترميم-فيلا/'],
    ['post', 'اختيار-مقاول', '/المدونة/اختيار-مقاول/'],
    ['category', 'المقاولات-والبناء', '/المدونة/الفئات/المقاولات-والبناء/'],
  ] as const)('maps %s to its route prefix', (type, slug, expected) => {
    expect(decodeURI(routeForSlug(type, slug))).toBe(expected)
  })

  test.each(['/', 'https://example.com/a', '//example.com', 'slug?x=1', 'slug#part', 'a/b'])(
    'rejects unsafe slug input: %s',
    (slug) => expect(() => routeForSlug('service', slug)).toThrow('Unsafe slug'),
  )
})

describe('publish orchestration', () => {
  test('fetches the published document, patches redirectFrom, then delegates publish', async () => {
    const calls: string[] = []
    const getDocument = vi.fn(async () => {
      calls.push('getDocument')
      return {
        _id: 'service-id',
        _type: 'service',
        _createdAt: '2026-08-13T00:00:00Z',
        _updatedAt: '2026-08-13T00:00:00Z',
        _rev: 'revision',
        slug: { current: 'الخدمة-القديمة' },
      }
    })
    const patchDraft = vi.fn(async (redirectFrom: string[]) => {
      calls.push(`patch:${redirectFrom.length}`)
    })
    const publish = vi.fn(() => calls.push('publish'))

    await captureSlugAndPublish({
      id: 'service-id',
      type: 'service',
      draftSlug: 'الخدمة-الجديدة',
      redirectFrom: [],
      getDocument,
      patchDraft,
      publish,
    })

    expect(getDocument).toHaveBeenCalledWith('service-id')
    expect(patchDraft).toHaveBeenCalledWith([routeForSlug('service', 'الخدمة-القديمة')])
    expect(calls).toEqual(['getDocument', 'patch:1', 'publish'])
  })

  test('delegates directly when this is the first publication', async () => {
    const patchDraft = vi.fn()
    const publish = vi.fn()

    await captureSlugAndPublish({
      id: 'new-project',
      type: 'project',
      draftSlug: 'مشروع-جديد',
      redirectFrom: [],
      getDocument: vi.fn(async () => undefined),
      patchDraft,
      publish,
    })

    expect(patchDraft).not.toHaveBeenCalled()
    expect(publish).toHaveBeenCalledOnce()
  })
})
