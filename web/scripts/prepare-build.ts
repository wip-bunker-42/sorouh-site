import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createBuildClient } from '../src/sanity/client'
import { SITE_SNAPSHOT_QUERY } from '../src/sanity/queries'
import { normalizeSnapshot } from '../src/lib/content/normalize'
import { validateRawSnapshot } from '../src/lib/content/validate'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const outputPath = resolve(webRoot, 'src/data/site-snapshot.json')

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
  return snapshot
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = await prepareBuild()
  console.log(
    `Prepared static snapshot: ${snapshot.services.length} services, ${snapshot.areas.length} areas, ${snapshot.projects.length} projects, ${snapshot.posts.length} posts`,
  )
}
