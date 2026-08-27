import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { INDEXNOW_ENDPOINT, buildIndexNowPayload, extractSitemapUrls } from './lib/indexnow'

const ORIGIN = 'https://sorouh.site'
const KEY_FILE = 'c26bd121-4a0d-4e9a-9e83-d293df73fb50.txt'
const dryRun = process.argv.includes('--dry-run')
const apply = process.argv.includes('--apply')

if (dryRun === apply) throw new Error('Choose exactly one mode: --dry-run or --apply')

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const key = (await readFile(resolve(root, 'web', 'public', KEY_FILE), 'utf8')).trim()
const sitemapResponse = await fetch(`${ORIGIN}/sitemap-pages.xml`)
if (!sitemapResponse.ok)
  throw new Error(`Could not read production sitemap: HTTP ${sitemapResponse.status}`)

const payload = buildIndexNowPayload({
  origin: ORIGIN,
  key,
  urls: extractSitemapUrls(await sitemapResponse.text(), ORIGIN),
})

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        mode: 'dry-run',
        endpoint: INDEXNOW_ENDPOINT,
        host: payload.host,
        keyLocation: payload.keyLocation,
        urlCount: payload.urlList.length,
      },
      null,
      2,
    ),
  )
} else {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow submission failed: HTTP ${response.status}`)
  }

  console.log(
    JSON.stringify(
      {
        mode: 'apply',
        host: payload.host,
        urlCount: payload.urlList.length,
        responseStatus: response.status,
      },
      null,
      2,
    ),
  )
}
