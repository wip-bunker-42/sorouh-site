import { pathToFileURL } from 'node:url'

type Fetcher = typeof fetch

type VerifyOptions = {
  fetcher?: Fetcher
  attempts?: number
  retryDelayMs?: number
}

const ORIGIN = 'https://sorouh.site'
const REQUEST_TIMEOUT_MS = 15_000
const REQUIRED_SEO_URLS = [
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
] as const
const WITHDRAWN_URLS = [
  '/الخدمات/عزل-الاسطح/',
  '/الخدمات/كشف-ومعالجة-تسربات-المياه/',
  '/الخدمات/عزل-الاسطح/الدمام/',
  '/الخدمات/عزل-الاسطح/الاحساء/',
  '/المدونة/دليل-اختيار-عزل-الاسطح/',
] as const

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function delay(milliseconds: number) {
  if (milliseconds > 0) await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function retry<T>(operation: () => Promise<T>, attempts: number, retryDelayMs: number) {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt < attempts) await delay(retryDelayMs)
    }
  }
  throw lastError
}

export async function verifyProduction({
  fetcher = fetch,
  attempts = 6,
  retryDelayMs = 10_000,
}: VerifyOptions = {}) {
  return retry(
    async () => {
      const request = (url: string, init: RequestInit = {}) =>
        fetcher(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

      const home = await request(`${ORIGIN}/`)
      assert(home.status === 200, `home returned ${home.status}`)
      const homeHtml = await home.text()
      assert(
        homeHtml.includes(`<link rel="canonical" href="${ORIGIN}/"`),
        'home canonical does not match the production origin',
      )

      const sitemap = await request(`${ORIGIN}/sitemap.xml`)
      assert(sitemap.status === 200, `sitemap index returned ${sitemap.status}`)
      const sitemapXml = await sitemap.text()
      assert(
        sitemapXml.includes(`${ORIGIN}/sitemap-pages.xml`),
        'sitemap index does not reference the page sitemap',
      )

      const pages = await request(`${ORIGIN}/sitemap-pages.xml`)
      assert(pages.status === 200, `page sitemap returned ${pages.status}`)
      const pagesXml = await pages.text()
      assert(
        pagesXml.includes(`<loc>${ORIGIN}/</loc>`),
        'page sitemap does not include the home URL',
      )
      const pageUrls = new Set(
        [...pagesXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(
          (match) => new URL(match[1]!).href,
        ),
      )
      for (const path of WITHDRAWN_URLS) {
        assert(
          !pageUrls.has(new URL(path, ORIGIN).href),
          `page sitemap still includes withdrawn ${path}`,
        )
      }
      for (const path of REQUIRED_SEO_URLS) {
        const url = `${ORIGIN}${path}`
        const canonical = new URL(path, ORIGIN).href
        assert(pageUrls.has(canonical), `page sitemap does not include ${path}`)
        const response = await request(url)
        assert(response.status === 200, `${path} returned ${response.status}`)
        const html = await response.text()
        assert(
          html.includes(`<link rel="canonical" href="${canonical}"`),
          `${path} canonical is wrong`,
        )
        assert(
          /<meta name="robots" content="[^"]*index, follow/.test(html),
          `${path} is not indexable`,
        )
        assert((html.match(/<h1(?:\s[^>]*)?>/g) ?? []).length === 1, `${path} does not have one H1`)
      }
      for (const path of WITHDRAWN_URLS) {
        const response = await request(`${ORIGIN}${path}`, { redirect: 'manual' })
        assert(response.status === 404, `withdrawn ${path} returned ${response.status}`)
      }

      const www = await request('https://www.sorouh.site/', { redirect: 'manual' })
      assert(www.status === 301, `www redirect returned ${www.status}`)
      assert(www.headers.get('location') === `${ORIGIN}/`, 'www redirect target is not canonical')

      return { origin: ORIGIN, checkedUrls: 4 + REQUIRED_SEO_URLS.length + WITHDRAWN_URLS.length }
    },
    attempts,
    retryDelayMs,
  )
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const result = await verifyProduction()
  console.log(`Production verified: ${result.checkedUrls} checks for ${result.origin}`)
}
