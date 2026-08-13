import { describe, expect, test } from 'vitest'
import { loadSnapshot } from '../content/load-snapshot'
import { pageEntries, redirects, rss, sitemapPages, sitemapVideos } from '../seo/discovery'
const data = loadSnapshot()
describe('static discovery', () => {
  test('lists every canonical public page and real update timestamps', () => {
    const entries = pageEntries(data)
    expect(entries).toHaveLength(46)
    expect(entries.filter((e) => e.lastmod).every((e) => e.lastmod?.startsWith('2026-'))).toBe(true)
    expect(sitemapPages(data)).not.toMatch(/changefreq|priority/)
  })
  test('emits four indexed YouTube videos', () => {
    const output = sitemapVideos(data)
    expect(output.match(/<video:video>/g)).toHaveLength(4)
    expect(output).toContain('https://www.youtube.com/embed/IK7jw0fu3zE')
  })
  test('uses valid RSS author and canonical links', () => {
    const output = rss(data)
    expect(output.match(/<item>/g)).toHaveLength(5)
    expect(output).toContain('info@sorouh.site (شركة صروح الشرقية للمقاولات)')
  })
  test('never creates host redirects', () => {
    expect(redirects(data)).not.toMatch(/http|www\./)
  })
})
