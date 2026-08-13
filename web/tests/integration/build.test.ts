import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'

const dist = join(import.meta.dirname, '../../dist')

function read(relativePath: string) {
  return readFileSync(join(dist, relativePath), 'utf8')
}

describe('production build', () => {
  it('contains every expected static route family', () => {
    expect(existsSync(join(dist, 'index.html'))).toBe(true)
    expect(existsSync(join(dist, 'الخدمات/index.html'))).toBe(true)
    expect(existsSync(join(dist, 'مناطق-الخدمة/index.html'))).toBe(true)
    expect(existsSync(join(dist, 'مشاريعنا/index.html'))).toBe(true)
    expect(existsSync(join(dist, 'المدونة/index.html'))).toBe(true)
    expect(existsSync(join(dist, '404.html'))).toBe(true)
  })

  it('ships the static discovery documents', () => {
    for (const file of [
      'sitemap.xml',
      'sitemap-pages.xml',
      'sitemap-videos.xml',
      'rss.xml',
      'robots.txt',
      'llms.txt',
      '_headers',
      '_redirects',
    ]) {
      expect(existsSync(join(dist, file)), `${file} is missing`).toBe(true)
    }
  })

  it('renders canonical, Arabic direction and organization schema into HTML', () => {
    const $ = load(read('index.html'))
    expect($('html').attr('lang')).toBe('ar-SA')
    expect($('html').attr('dir')).toBe('rtl')
    expect($('link[rel="canonical"]').attr('href')).toBe('https://sorouh.site/')
    expect($('script[type="application/ld+json"]').length).toBeGreaterThan(0)
  })

  it('does not inject GTM when its optional environment variable is absent', () => {
    expect(read('index.html')).not.toContain('googletagmanager.com')
  })

  it('uses page-specific Sanity share images on editorial pages', () => {
    const $ = load(read('المدونة/كيف-تختار-مقاول-في-الدمام/index.html'))
    expect($('meta[property="og:image"]').attr('content')).toMatch(
      /^https:\/\/cdn\.sanity\.io\/images\/ki7bs4vk\/production\//,
    )
    expect($('meta[name="robots"]').attr('content')).toContain('index, follow')
  })

  it('ships only verified YouTube publication dates and valid redirect paths', () => {
    const videos = read('sitemap-videos.xml')
    expect(videos).toContain('<video:publication_date>2026-08-12</video:publication_date>')
    expect(videos).not.toContain('2026-08-01')
    expect(read('_redirects')).not.toContain('//الخدمات/')
  })
})
