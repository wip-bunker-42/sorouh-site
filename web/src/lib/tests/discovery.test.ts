import { describe, expect, test } from 'vitest'
import { fileURLToPath } from 'node:url'
import { loadSnapshot } from '../content/load-snapshot'
import { normalizeSnapshot } from '../content/normalize'
import { validateRawSnapshot } from '../content/validate'
import { pageEntries, redirects, rss, sitemapPages, sitemapVideos } from '../seo/discovery'
const fixturePath = fileURLToPath(
  new URL('../../../tests/fixtures/site-snapshot.json', import.meta.url),
)
const data = normalizeSnapshot(validateRawSnapshot(loadSnapshot(fixturePath)))
describe('static discovery', () => {
  test('lists every canonical public page and real update timestamps', () => {
    const entries = pageEntries(data)
    expect(entries).toHaveLength(10)
    expect(entries.filter((e) => e.lastmod).every((e) => e.lastmod?.startsWith('2026-'))).toBe(true)
    expect(sitemapPages(data)).not.toMatch(/changefreq|priority/)
  })
  test('emits an indexed YouTube video with verified metadata', () => {
    const output = sitemapVideos(data)
    expect(output.match(/<video:video>/g)).toHaveLength(1)
    expect(output).toContain('https://www.youtube.com/embed/IK7jw0fu3zE')
  })
  test('uses valid RSS author and canonical links', () => {
    const output = rss(data)
    expect(output.match(/<item>/g)).toHaveLength(1)
    expect(output).toContain('info@sorouh.site (شركة صروح الشرقية للمقاولات)')
  })
  test('never creates host redirects', () => {
    expect(redirects(data)).not.toMatch(/http|www\./)
  })
  test('emits captured full old routes without duplicating their route prefix', () => {
    const snapshot = structuredClone(data)
    snapshot.services[0]!.redirectFrom = ['/الخدمات/الاسم-القديم/']
    const output = redirects(snapshot)
    expect(output).toContain('/الخدمات/الاسم-القديم/ /الخدمات/مقاولات-عامة/ 301')
    expect(output).not.toContain('/الخدمات//الخدمات/')
  })
})
