import { getCliClient } from 'sanity/cli'

import {
  keywordContentWave,
  keywordContentWaveImprovements,
  validateKeywordContentWave,
} from '../content/sorouh/seo/keyword-content-wave'
import { serviceAreaLandings } from '../content/sorouh/service-area-landings'
import { buildKeywordContentWavePlan } from './lib/build-keyword-content-wave-patches'

const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const dryRun = process.argv.includes('--dry-run')
const apply = process.argv.includes('--apply')

if (dryRun === apply) throw new Error('Choose exactly one mode: --dry-run or --apply')

const client = getCliClient({ apiVersion: '2026-08-13' }).withConfig({ dataset: DATASET })
const config = client.config()
if (config.projectId !== EXPECTED_PROJECT_ID || config.dataset !== DATASET) {
  throw new Error(
    `Refusing keyword content wave: expected ${EXPECTED_PROJECT_ID}/${DATASET}, received ${config.projectId}/${config.dataset}`,
  )
}

validateKeywordContentWave(
  keywordContentWave,
  new Set(serviceAreaLandings.map((landing) => landing.key)),
)

const serviceKeys = [...new Set(keywordContentWave.map((entry) => entry.serviceKey))]
const areaKeys = [...new Set(keywordContentWave.map((entry) => entry.areaKey))]
const serviceIds = serviceKeys.map((key) => `service-${key}`)
const areaIds = areaKeys.map((key) => `area-${key}`)
const improvementIds = keywordContentWaveImprovements.map((entry) => `service-area-${entry.key}`)

const [services, areas, existingLandingIds, existingLandingDocuments] = await Promise.all([
  client.fetch<Array<{ _id: string; heroImage?: Record<string, unknown> }>>(
    `*[_id in $ids && !(_id in path("drafts.**"))]{_id, heroImage}`,
    { ids: serviceIds },
  ),
  client.fetch<Array<{ _id: string }>>(`*[_id in $ids && !(_id in path("drafts.**"))]{_id}`, {
    ids: areaIds,
  }),
  client.fetch<string[]>(`*[_type == "serviceAreaLanding" && !(_id in path("drafts.**"))]._id`),
  client.fetch<
    Array<{
      _id: string
      faqs?: Array<{ _type?: 'faqItem'; _key?: string; question: string; answer: string }>
      seo?: Record<string, unknown>
      serviceId?: string
      areaId?: string
    }>
  >(
    `*[_id in $ids && !(_id in path("drafts.**"))]{_id, faqs, seo, "serviceId": service._ref, "areaId": serviceArea._ref}`,
    { ids: improvementIds },
  ),
])

const serviceDocuments = new Map(
  services.map((document) => {
    const key = document._id.replace(/^service-/, '')
    if (!document.heroImage) throw new Error(`Missing service hero image: ${document._id}`)
    return [key, { id: document._id, heroImage: document.heroImage }] as const
  }),
)
const areaDocuments = new Map(
  areas.map((document) => [document._id.replace(/^area-/, ''), { id: document._id }] as const),
)
const existingById = new Map(
  existingLandingDocuments.map((document) => [
    document._id,
    { faqs: document.faqs, seo: document.seo },
  ]),
)
const plan = buildKeywordContentWavePlan({
  entries: keywordContentWave,
  improvements: keywordContentWaveImprovements,
  serviceDocuments,
  areaDocuments,
  existingLandingDocuments: existingById,
  existingIds: new Set(existingLandingIds),
})

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        projectId: config.projectId,
        dataset: config.dataset,
        mode: 'dry-run',
        creates: plan.creates.map((document) => document._id),
        patches: plan.patches.map((patch) => patch.id),
        unchanged: plan.unchanged,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const transaction = client.transaction()
for (const document of plan.creates) transaction.create(document as any)
for (const patch of plan.patches) transaction.patch(patch.id, { set: patch.set })
await transaction.commit({ visibility: 'sync' })

const expectedIds = [
  ...plan.creates.map((document) => document._id as string),
  ...plan.patches.map((patch) => patch.id),
]
const verifiedDocuments = await client.fetch<
  Array<{ _id: string; title?: string; serviceId?: string; areaId?: string }>
>(`*[_id in $ids]{_id, title, "serviceId": service._ref, "areaId": serviceArea._ref}`, {
  ids: expectedIds,
})
for (const document of plan.creates) {
  const actual = verifiedDocuments.find((item) => item._id === document._id)
  const service = document.service as { _ref?: string }
  const area = document.serviceArea as { _ref?: string }
  if (
    !actual ||
    actual.title !== document.title ||
    actual.serviceId !== service._ref ||
    actual.areaId !== area._ref
  ) {
    throw new Error(`Keyword content verification failed: ${document._id}`)
  }
}
for (const patch of plan.patches) {
  const actual = verifiedDocuments.find((item) => item._id === patch.id)
  const before = existingLandingDocuments.find((item) => item._id === patch.id)
  const expectedTitle = patch.set.title as string
  if (
    !actual ||
    actual.title !== expectedTitle ||
    actual.serviceId !== before?.serviceId ||
    actual.areaId !== before?.areaId
  ) {
    throw new Error(`Keyword content verification failed: ${patch.id}`)
  }
}

console.log(
  JSON.stringify(
    {
      projectId: config.projectId,
      dataset: config.dataset,
      mode: 'apply',
      createdDocuments: plan.creates.length,
      patchedDocuments: plan.patches.length,
      verifiedDocuments: verifiedDocuments.length,
    },
    null,
    2,
  ),
)
