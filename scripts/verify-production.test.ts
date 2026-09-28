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

const qualifiedPaths = [
  '/الخدمات/ترميم-منازل-وفلل/الدمام/',
  '/الخدمات/دهانات-داخلية-وخارجية/الدمام/',
  '/الخدمات/جبس-بورد/الدمام/',
  '/الخدمات/اعمال-السباكة/الدمام/',
  '/الخدمات/اعمال-الكهرباء/الدمام/',
  '/الخدمات/مقاول-بناء/الدمام/',
  '/الخدمات/ترميم-منازل-وفلل/الخبر/',
  '/الخدمات/دهانات-داخلية-وخارجية/الخبر/',
  '/الخدمات/اعمال-السباكة/الخبر/',
  '/الخدمات/بناء-الملاحق/',
  '/الخدمات/الهدم-والازالة/',
  '/المدونة/علامات-تسرب-المياه-قبل-الترميم/',
  '/المدونة/تخطيط-الجبس-بورد-قبل-الاغلاق/',
  '/المدونة/تجهيز-الجدران-قبل-الدهان/',
  '/المدونة/قائمة-بناء-ملحق-للفيلا/',
]
const withdrawnPaths = [
  '/الخدمات/عزل-الاسطح/',
  '/الخدمات/كشف-ومعالجة-تسربات-المياه/',
  '/الخدمات/عزل-الاسطح/الدمام/',
  '/الخدمات/عزل-الاسطح/الاحساء/',
  '/المدونة/دليل-اختيار-عزل-الاسطح/',
]
const fixture = (
  options: { extraSitemapPath?: string; withdrawnStatus?: number; missingPath?: string } = {},
) =>
  vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
    const url = String(input)
    if (url === 'https://sorouh.site/') return html('https://sorouh.site/')
    if (url === 'https://sorouh.site/sitemap.xml')
      return new Response(
        '<sitemapindex><loc>https://sorouh.site/sitemap-pages.xml</loc></sitemapindex>',
      )
    if (url === 'https://sorouh.site/sitemap-pages.xml')
      return new Response(
        `<urlset><loc>https://sorouh.site/</loc>${[...qualifiedPaths.filter((path) => path !== options.missingPath), ...(options.extraSitemapPath ? [options.extraSitemapPath] : [])].map((path) => `<loc>https://sorouh.site${path}</loc>`).join('')}</urlset>`,
      )
    if (qualifiedPaths.some((path) => url === `https://sorouh.site${path}`))
      return html(new URL(url).href)
    if (withdrawnPaths.some((path) => url === `https://sorouh.site${path}`))
      return new Response(null, {
        status: options.withdrawnStatus ?? 404,
        ...(options.withdrawnStatus === 301
          ? { headers: { location: new URL('https://sorouh.site/الخدمات/اعمال-السباكة/').href } }
          : {}),
      })
    if (url === 'https://www.sorouh.site/')
      return new Response(null, { status: 301, headers: { location: 'https://sorouh.site/' } })
    return new Response(null, { status: 404 })
  })

describe('production verification', () => {
  test('accepts qualified landings and checks withdrawn pages without following redirects', async () => {
    const fetcher = fixture()

    await expect(verifyProduction({ fetcher, attempts: 1, retryDelayMs: 0 })).resolves.toEqual({
      origin: 'https://sorouh.site',
      checkedUrls: 24,
    })
    expect(fetcher.mock.calls).toHaveLength(24)
    expect(fetcher.mock.calls.every(([, init]) => init?.signal instanceof AbortSignal)).toBe(true)
    for (const path of withdrawnPaths)
      expect(
        fetcher.mock.calls.find(([url]) => url === `https://sorouh.site${path}`)?.[1]?.redirect,
      ).toBe('manual')
  })

  test.each(withdrawnPaths)('rejects a withdrawn URL still in the sitemap: %s', async (path) => {
    await expect(
      verifyProduction({
        fetcher: fixture({ extraSitemapPath: encodeURI(path) }),
        attempts: 1,
        retryDelayMs: 0,
      }),
    ).rejects.toThrow(`page sitemap still includes withdrawn ${path}`)
  })

  test.each([200, 301])('rejects a withdrawn page returning %s', async (status) => {
    await expect(
      verifyProduction({
        fetcher: fixture({ withdrawnStatus: status }),
        attempts: 1,
        retryDelayMs: 0,
      }),
    ).rejects.toThrow(`withdrawn /الخدمات/عزل-الاسطح/ returned ${status}`)
  })

  test('requires the gypsum Dammam owner in the sitemap', async () => {
    const path = '/الخدمات/جبس-بورد/الدمام/'
    await expect(
      verifyProduction({ fetcher: fixture({ missingPath: path }), attempts: 1, retryDelayMs: 0 }),
    ).rejects.toThrow(`page sitemap does not include ${path}`)
  })

  test('rejects an incorrect canonical instead of accepting a merely successful response', async () => {
    const fetcher = vi.fn(async () => html('https://example.com/'))

    await expect(verifyProduction({ fetcher, attempts: 1, retryDelayMs: 0 })).rejects.toThrow(
      'canonical',
    )
  })
})
