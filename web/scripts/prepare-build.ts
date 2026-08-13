import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createBuildClient } from '../src/sanity/client'
import { SITE_SNAPSHOT_QUERY } from '../src/sanity/queries'
import { normalizeSnapshot } from '../src/lib/content/normalize'
import { validateRawSnapshot } from '../src/lib/content/validate'
import { redirects, rss, sitemapIndex, sitemapPages, sitemapVideos } from '../src/lib/seo/discovery'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const outputPath = resolve(webRoot, 'src/data/site-snapshot.json')

const localEnvironmentPath = resolve(webRoot, '.env')
if (existsSync(localEnvironmentPath)) process.loadEnvFile(localEnvironmentPath)

async function readFixture(path: string): Promise<unknown> {
  const absolutePath = isAbsolute(path) ? path : resolve(webRoot, path)
  return JSON.parse(await readFile(absolutePath, 'utf8')) as unknown
}

export async function fetchRawSnapshot(
  environment: NodeJS.ProcessEnv = process.env,
): Promise<unknown> {
  const fixturePath = environment.CONTENT_FIXTURE_PATH?.trim()
  if (fixturePath) return readFixture(fixturePath)

  const client = createBuildClient(environment)
  return client.fetch(SITE_SNAPSHOT_QUERY)
}

export async function writeSnapshotAtomically(value: unknown, destination = outputPath) {
  await mkdir(dirname(destination), { recursive: true })
  const temporaryPath = `${destination}.${process.pid}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, destination)
}

export async function prepareBuild(environment: NodeJS.ProcessEnv = process.env) {
  const raw = await fetchRawSnapshot(environment)
  const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
  await writeSnapshotAtomically(snapshot)
  const publicDir = resolve(webRoot, 'public')
  await mkdir(publicDir, { recursive: true })
  await Promise.all([
    writeFile(resolve(publicDir, 'sitemap.xml'), sitemapIndex()),
    writeFile(resolve(publicDir, 'sitemap-pages.xml'), sitemapPages(snapshot)),
    writeFile(resolve(publicDir, 'sitemap-videos.xml'), sitemapVideos(snapshot)),
    writeFile(resolve(publicDir, 'rss.xml'), rss(snapshot)),
    writeFile(
      resolve(publicDir, 'robots.txt'),
      'User-agent: *\nAllow: /\nSitemap: https://sorouh.site/sitemap.xml\n',
    ),
    writeFile(
      resolve(publicDir, 'llms.txt'),
      '# شركة صروح الشرقية للمقاولات\n\nشركة مقاولات عربية تخدم الدمام والخبر ومدن المنطقة الشرقية.\n\n- الموقع: https://sorouh.site/\n- الخدمات: https://sorouh.site/الخدمات/\n- المشاريع: https://sorouh.site/مشاريعنا/\n- مناطق الخدمة: https://sorouh.site/مناطق-الخدمة/\n- المدونة: https://sorouh.site/المدونة/\n- التواصل: اتصال وواتساب على +966546121683، والرقم الاحتياطي +966546745928.\n',
    ),
    writeFile(resolve(publicDir, '_redirects'), redirects(snapshot)),
  ])
  return snapshot
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = await prepareBuild()
  console.log(
    `Prepared static snapshot: ${snapshot.services.length} services, ${snapshot.areas.length} areas, ${snapshot.projects.length} projects, ${snapshot.posts.length} posts`,
  )
}
