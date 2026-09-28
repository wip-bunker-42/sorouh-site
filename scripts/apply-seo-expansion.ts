import { getCliClient } from 'sanity/cli'

import { SERVICE_KEYS } from '../content/sorouh/site-content'
import { buildSeoExpansionPatches } from './lib/build-seo-expansion-patches'

const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const dryRun = process.argv.includes('--dry-run')
const apply = process.argv.includes('--apply')

if (dryRun === apply) throw new Error('Choose exactly one mode: --dry-run or --apply')

const client = getCliClient({ apiVersion: '2026-08-13' }).withConfig({ dataset: DATASET })
const config = client.config()
if (config.projectId !== EXPECTED_PROJECT_ID || config.dataset !== DATASET) {
  throw new Error(
    `Refusing SEO expansion: expected ${EXPECTED_PROJECT_ID}/${DATASET}, received ${config.projectId}/${config.dataset}`,
  )
}

const featuredServiceIds = [
  `service-${SERVICE_KEYS.annexConstruction}`,
  `service-${SERVICE_KEYS.demolition}`,
]
const homePage = await client.fetch<{
  _id: string
  featuredServices?: Array<{ _ref?: string; _key?: string }>
} | null>(`*[_id == "homePage"][0]{_id, featuredServices[]{_ref, _key}}`)
const areas = await client.fetch<
  Array<{ _id: string; featuredServices?: Array<{ _ref?: string; _key?: string }> }>
>(
  `*[_type == "serviceArea" && !(_id in path("drafts.**"))] | order(_id asc){_id, featuredServices[]{_ref, _key}}`,
)
if (!homePage) throw new Error('Missing homePage required for SEO expansion')

const patches = buildSeoExpansionPatches({ homePage, areas, featuredServiceIds })
if (dryRun) {
  console.log(
    JSON.stringify(
      {
        projectId: config.projectId,
        dataset: config.dataset,
        mode: 'dry-run',
        featuredServiceIds,
        targetDocuments: patches.map((patch) => patch.documentId),
        patchCount: patches.length,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const existingServices = new Set(
  await client.fetch<string[]>(`*[_id in $ids]._id`, { ids: featuredServiceIds }),
)
const missingServices = featuredServiceIds.filter((id) => !existingServices.has(id))
if (missingServices.length > 0) {
  throw new Error(
    `Missing reviewed services required for SEO expansion: ${missingServices.join(', ')}`,
  )
}

const transaction = client.transaction()
for (const patch of patches) transaction.patch(patch.documentId, { set: patch.set })
await transaction.commit({ visibility: 'sync' })

const updated = await client.fetch<
  Array<{ _id: string; featuredServices?: Array<{ _ref?: string }> }>
>(`*[_id in $ids]{_id, featuredServices[]{_ref}}`, {
  ids: patches.map((patch) => patch.documentId),
})
for (const patch of patches) {
  const document = updated.find((item) => item._id === patch.documentId)
  const actual = document?.featuredServices?.map((item) => item._ref) ?? []
  for (const id of featuredServiceIds) {
    if (actual.filter((item) => item === id).length !== 1) {
      throw new Error(`SEO expansion verification failed: ${patch.documentId} is missing ${id}`)
    }
  }
}

console.log(
  JSON.stringify(
    {
      projectId: config.projectId,
      dataset: config.dataset,
      mode: 'apply',
      patchCount: patches.length,
      verifiedDocuments: updated.length,
    },
    null,
    2,
  ),
)
