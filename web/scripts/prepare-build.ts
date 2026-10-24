import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createBuildClient } from '../src/sanity/client'
import { SITE_SNAPSHOT_QUERY } from '../src/sanity/queries'
import { normalizeSnapshot } from '../src/lib/content/normalize'
import { validateRawSnapshot } from '../src/lib/content/validate'
import { validateRenderContract } from '../src/lib/content/contract'
import { redirects, rss, sitemapIndex, sitemapPages, sitemapVideos } from '../src/lib/seo/discovery'
import { SITE_ORIGIN } from '../src/config/site'
import { fetchBuildContent } from '../../scripts/check-published-content.mjs'

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
  const fixturePath = environment.CONTENT_FIXTURE_PATH?.trim()
  const buildInput = fixturePath
    ? { snapshot: await readFixture(fixturePath), digest: undefined }
    : await fetchBuildContent(createBuildClient(environment), SITE_SNAPSHOT_QUERY)
  const raw = buildInput.snapshot
  const snapshot = validateRenderContract(normalizeSnapshot(validateRawSnapshot(raw)))
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
      `User-agent: *\nAllow: /\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
    ),
    writeFile(
      resolve(publicDir, 'llms.txt'),
      `# ${snapshot.siteSettings.companyName}\n\n${snapshot.siteSettings.tagline}.\n\n- الموقع: ${SITE_ORIGIN}/\n- الخدمات: ${SITE_ORIGIN}/الخدمات/\n- المشاريع: ${SITE_ORIGIN}/مشاريعنا/\n- مناطق الخدمة: ${SITE_ORIGIN}/مناطق-الخدمة/\n- المدونة: ${SITE_ORIGIN}/المدونة/\n- التواصل: اتصال وواتساب على ${snapshot.siteSettings.primaryPhone}، والرقم الاحتياطي ${snapshot.siteSettings.backupPhone}.\n`,
    ),
    writeFile(resolve(publicDir, '_redirects'), redirects(snapshot)),
  ])
  const revisionPath = environment.DEPLOYED_CONTENT_REVISION_PATH
  if (revisionPath) {
    if (!buildInput.digest) throw new Error('A fixture build cannot record a production revision')
    const destination = resolve(webRoot, revisionPath)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, `${buildInput.digest}\n`)
  }
  return snapshot
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = await prepareBuild()
  console.log(
    `Prepared static snapshot: ${snapshot.services.length} services, ${snapshot.areas.length} areas, ${snapshot.projects.length} projects, ${snapshot.posts.length} posts`,
  )
}
