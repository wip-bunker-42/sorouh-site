import { describe, expect, test } from 'vitest'

import { buildIndexNowPayload, extractSitemapUrls } from './indexnow'

const origin = 'https://sorouh.site'

describe('extractSitemapUrls', () => {
  test('returns unique canonical URLs from a pages sitemap', () => {
    const urls = extractSitemapUrls(
      `<?xml version="1.0"?><urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/الخدمات/ترميم-منازل/</loc></url><url><loc>${origin}/</loc></url></urlset>`,
      origin,
    )

    expect(urls).toEqual([`${origin}/`, new URL(`${origin}/الخدمات/ترميم-منازل/`).href])
  })

  test('refuses a sitemap URL outside the verified host', () => {
    expect(() =>
      extractSitemapUrls(`<urlset><url><loc>https://example.com/page</loc></url></urlset>`, origin),
    ).toThrow('outside the verified origin')
  })
})

describe('buildIndexNowPayload', () => {
  test('uses the canonical host and a root key file', () => {
    expect(
      buildIndexNowPayload({
        origin,
        key: 'c26bd121-4a0d-4e9a-9e83-d293df73fb50',
        urls: [`${origin}/`, `${origin}/المدونة/دليل-ترميم/`],
      }),
    ).toEqual({
      host: 'sorouh.site',
      key: 'c26bd121-4a0d-4e9a-9e83-d293df73fb50',
      keyLocation: `${origin}/c26bd121-4a0d-4e9a-9e83-d293df73fb50.txt`,
      urlList: [`${origin}/`, new URL(`${origin}/المدونة/دليل-ترميم/`).href],
    })
  })

  test('rejects invalid keys and mixed-host submissions', () => {
    expect(() => buildIndexNowPayload({ origin, key: 'short', urls: [`${origin}/`] })).toThrow(
      'IndexNow key',
    )
    expect(() =>
      buildIndexNowPayload({
        origin,
        key: 'c26bd121-4a0d-4e9a-9e83-d293df73fb50',
        urls: [`${origin}/`, 'https://www.sorouh.site/'],
      }),
    ).toThrow('outside the verified origin')
  })
})
