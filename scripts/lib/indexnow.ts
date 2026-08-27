const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

type IndexNowInput = {
  origin: string
  key: string
  urls: string[]
}

function verifiedOrigin(value: string) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`Expected a bare HTTPS origin, received: ${value}`)
  }
  return url
}

function validateUrl(urlValue: string, origin: URL) {
  const url = new URL(urlValue)
  if (url.origin !== origin.origin) {
    throw new Error(`Refusing URL outside the verified origin: ${urlValue}`)
  }
  return url.href
}

export function extractSitemapUrls(sitemap: string, origin: string) {
  const verified = verifiedOrigin(origin)
  const matches = sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)
  const urls = [...matches].map((match) => validateUrl(match[1]!.trim(), verified))
  if (urls.length === 0) throw new Error('No page URLs found in sitemap')
  return [...new Set(urls)]
}

export function buildIndexNowPayload({ origin, key, urls }: IndexNowInput) {
  const verified = verifiedOrigin(origin)
  if (!KEY_PATTERN.test(key))
    throw new Error('IndexNow key must be 8–128 letters, numbers, or dashes')
  if (urls.length === 0) throw new Error('Refusing to submit an empty URL list')
  if (urls.length > 10_000) throw new Error('IndexNow accepts at most 10,000 URLs per submission')

  const urlList = [...new Set(urls.map((url) => validateUrl(url, verified)))]
  return {
    host: verified.host,
    key,
    keyLocation: `${verified.origin}/${key}.txt`,
    urlList,
  }
}
