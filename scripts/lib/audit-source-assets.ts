import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

import { sourceAssets } from '../../content/sorouh/asset-manifest'

const root = resolve('work/source-media/sorouh')
const failures: string[] = []

for (const asset of sourceAssets) {
  const path = resolve(root, asset.sourcePath)
  try {
    const [buffer, details] = await Promise.all([readFile(path), stat(path)])
    const sha256 = createHash('sha256').update(buffer).digest('hex')
    if (details.size !== asset.bytes) failures.push(`${asset.key}: byte size differs`)
    if (sha256 !== asset.sha256) failures.push(`${asset.key}: SHA-256 differs`)
  } catch (error) {
    failures.push(`${asset.key}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures.length > 0) {
  throw new Error(`Source asset audit failed:\n${failures.join('\n')}`)
}

if (new Set(sourceAssets.map((asset) => asset.sourcePath)).size !== sourceAssets.length) {
  throw new Error('Source asset manifest contains duplicate paths')
}

console.log(`Source asset audit passed: ${sourceAssets.length} files, hashes and sizes match.`)
