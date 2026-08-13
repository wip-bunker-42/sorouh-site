import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { NormalizedSnapshot } from './normalize'

const packageRelative = resolve(process.cwd(), 'src/data/site-snapshot.json')
const workspaceRelative = resolve(process.cwd(), 'web/src/data/site-snapshot.json')
export const DEFAULT_SNAPSHOT_PATH = existsSync(resolve(process.cwd(), 'src/data'))
  ? packageRelative
  : workspaceRelative

export function loadSnapshot(path?: string): NormalizedSnapshot {
  const snapshotPath = path ?? DEFAULT_SNAPSHOT_PATH
  try {
    return JSON.parse(readFileSync(snapshotPath, 'utf8')) as NormalizedSnapshot
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    throw new Error(`Unable to load generated content snapshot at ${snapshotPath}: ${reason}`)
  }
}
