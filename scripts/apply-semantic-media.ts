import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getCliClient } from 'sanity/cli'

import {
  expectedSemanticMediaTargets,
  sorouhSemanticMediaPlan,
} from '../content/sorouh/semantic-media-plan'
import {
  assertManagedContentImage,
  buildSemanticMediaPatch,
} from './lib/build-semantic-media-patches'
import { validateSemanticMediaPlan } from './lib/semantic-media'

const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dryRun = process.argv.includes('--dry-run')
const apply = process.argv.includes('--apply')

if (dryRun === apply) {
  throw new Error('Choose exactly one mode: --dry-run or --apply')
}

const client = getCliClient({ apiVersion: '2026-08-13' }).withConfig({
  dataset: DATASET,
})
const config = client.config()

if (config.projectId !== EXPECTED_PROJECT_ID || config.dataset !== DATASET) {
  throw new Error(
    `Refusing media update: expected ${EXPECTED_PROJECT_ID}/${DATASET}, received ${config.projectId}/${config.dataset}`,
  )
}

validateSemanticMediaPlan(sorouhSemanticMediaPlan, expectedSemanticMediaTargets)

const files = new Map<string, Buffer>()
for (const asset of sorouhSemanticMediaPlan.assets) {
  files.set(asset.key, await readFile(resolve(root, asset.path)))
}

const existingDocumentIds = new Set(
  await client.fetch<string[]>(`*[_id in $ids]._id`, {
    ids: expectedSemanticMediaTargets,
  }),
)
const missingDocumentIds = expectedSemanticMediaTargets.filter((id) => !existingDocumentIds.has(id))
if (missingDocumentIds.length > 0) {
  throw new Error(`Missing published media targets: ${missingDocumentIds.join(', ')}`)
}

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        projectId: config.projectId,
        dataset: config.dataset,
        mode: 'dry-run',
        assets: sorouhSemanticMediaPlan.assets.length,
        placements: sorouhSemanticMediaPlan.placements.length,
        bytes: [...files.values()].reduce((total, buffer) => total + buffer.length, 0),
        missingDocuments: 0,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const assetIds = new Map<string, string>()
let uploadedAssets = 0
let reusedAssets = 0

for (const asset of sorouhSemanticMediaPlan.assets) {
  const buffer = files.get(asset.key)!
  const sha1hash = createHash('sha1').update(buffer).digest('hex')
  let assetId = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && sha1hash == $sha1hash][0]._id`,
    { sha1hash },
  )

  if (assetId) {
    reusedAssets += 1
  } else {
    const uploaded = await client.assets.upload('image', buffer, {
      filename: basename(asset.path),
      label: `sorouh-semantic:${asset.key}`,
    })
    assetId = uploaded._id
    uploadedAssets += 1
  }
  assetIds.set(asset.key, assetId)
}

const patches = sorouhSemanticMediaPlan.placements.map((placement) =>
  buildSemanticMediaPatch(placement, assetIds.get(placement.assetKey)!),
)
const transaction = client.transaction()
for (const patch of patches) {
  transaction.patch(patch.documentId, (builder) => {
    let documentPatch = builder.set(patch.set as any)
    if (patch.managedGalleryImage) {
      documentPatch = documentPatch
        .unset(['gallery[_key == "semantic-media-primary"]'])
        .setIfMissing({ gallery: [] })
        .insert('before', 'gallery[0]', [patch.managedGalleryImage] as any)
    }
    return documentPatch
  })
}
await transaction.commit({ visibility: 'sync' })

const updatedDocuments = await client.getDocuments(expectedSemanticMediaTargets)
const updatedById = new Map(
  updatedDocuments
    .filter((document): document is NonNullable<typeof document> => Boolean(document))
    .map((document) => [document._id, document]),
)

for (const patch of patches) {
  const document = updatedById.get(patch.documentId) as Record<string, any> | undefined
  if (!document) throw new Error(`Could not verify updated document: ${patch.documentId}`)

  for (const [path, expectedValue] of Object.entries(patch.set)) {
    const actualValue = path.split('.').reduce<any>((value, segment) => value?.[segment], document)
    const expectedImage = Array.isArray(expectedValue) ? expectedValue[0] : expectedValue
    const actualImage = Array.isArray(actualValue) ? actualValue[0] : actualValue
    assertManagedContentImage(actualImage, expectedImage, `${patch.documentId}.${path}`)
  }
  if (patch.managedGalleryImage) {
    const managedImage = document.gallery?.find(
      (image: Record<string, unknown>) => image._key === 'semantic-media-primary',
    )
    assertManagedContentImage(
      managedImage,
      patch.managedGalleryImage,
      `${patch.documentId}.gallery[semantic-media-primary]`,
    )
  }
}

console.log(
  JSON.stringify(
    {
      projectId: config.projectId,
      dataset: config.dataset,
      mode: 'apply',
      uploadedAssets,
      reusedAssets,
      patchedDocuments: patches.length,
      verifiedFields: patches.reduce(
        (total, patch) =>
          total + Object.keys(patch.set).length + (patch.managedGalleryImage ? 1 : 0),
        0,
      ),
    },
    null,
    2,
  ),
)
