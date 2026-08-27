import { describe, expect, test, vi } from 'vitest'

import { verifyProduction } from './verify-production'

const html = (canonical: string) =>
  new Response(
    `<html lang="ar" dir="rtl"><head><link rel="canonical" href="${canonical}"><meta name="robots" content="index, follow"></head><body><h1>عنوان الصفحة</h1></body></html>`,
    {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    },
  )

describe('production verification', () => {
  test('accepts the canonical host, sitemap index, page sitemap, and www redirect', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      if (url === 'https://sorouh.site/') return html('https://sorouh.site/')
      if (url === 'https://sorouh.site/sitemap.xml') {
        return new Response(
          '<sitemapindex><loc>https://sorouh.site/sitemap-pages.xml</loc></sitemapindex>',
        )
      }
      if (url === 'https://sorouh.site/sitemap-pages.xml') {
        return new Response(
          '<urlset><loc>https://sorouh.site/</loc><loc>https://sorouh.site/الخدمات/عزل-الاسطح/</loc><loc>https://sorouh.site/الخدمات/كشف-ومعالجة-تسربات-المياه/</loc><loc>https://sorouh.site/الخدمات/بناء-الملاحق/</loc><loc>https://sorouh.site/الخدمات/الهدم-والازالة/</loc><loc>https://sorouh.site/الخدمات/ترميم-منازل-وفلل/الدمام/</loc></urlset>',
        )
      }
      if (url.startsWith('https://sorouh.site/الخدمات/')) return html(new URL(url).href)
      if (url === 'https://www.sorouh.site/') {
        return new Response(null, {
          status: 301,
          headers: { location: 'https://sorouh.site/' },
        })
      }
      return new Response(null, { status: 404 })
    })

    await expect(verifyProduction({ fetcher, attempts: 1, retryDelayMs: 0 })).resolves.toEqual({
      origin: 'https://sorouh.site',
      checkedUrls: 9,
    })
    expect(fetcher.mock.calls).toHaveLength(9)
    expect(fetcher.mock.calls.every(([, init]) => init?.signal instanceof AbortSignal)).toBe(true)
  })

  test('rejects an incorrect canonical instead of accepting a merely successful response', async () => {
    const fetcher = vi.fn(async () => html('https://example.com/'))

    await expect(verifyProduction({ fetcher, attempts: 1, retryDelayMs: 0 })).rejects.toThrow(
      'canonical',
    )
  })
})
