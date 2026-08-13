import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import generatedSnapshot from '../../data/site-snapshot.json'
import type { NormalizedSnapshot } from './normalize'

export const DEFAULT_SNAPSHOT_PATH = fileURLToPath(
  new URL('../../data/site-snapshot.json', import.meta.url),
)

export function loadSnapshot(path?: string): NormalizedSnapshot {
  if (!path || path === DEFAULT_SNAPSHOT_PATH)
    return generatedSnapshot as unknown as NormalizedSnapshot
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as NormalizedSnapshot
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    throw new Error(`Unable to load generated content snapshot at ${path}: ${reason}`)
  }
}
