import { getCliClient } from 'sanity/cli'

import {
  AHREFS_META_DESCRIPTION_TARGETS,
  buildAhrefsMetaRemediationPatches,
} from './lib/ahrefs-meta-remediation'

const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const dryRun = process.argv.includes('--dry-run')
const apply = process.argv.includes('--apply')

if (dryRun === apply) throw new Error('Choose exactly one mode: --dry-run or --apply')

const client = getCliClient({ apiVersion: '2026-08-27' }).withConfig({ dataset: DATASET })
const config = client.config()
if (config.projectId !== EXPECTED_PROJECT_ID || config.dataset !== DATASET) {
  throw new Error(
    `Refusing Ahrefs remediation: expected ${EXPECTED_PROJECT_ID}/${DATASET}, received ${config.projectId}/${config.dataset}`,
  )
}

const ids = AHREFS_META_DESCRIPTION_TARGETS.map((target) => target.documentId)
const documents = await client.fetch<Array<{ _id: string; _type: string }>>(
  `*[_id in $ids && !(_id in path("drafts.**"))]{_id, _type}`,
  { ids },
)
const patches = buildAhrefsMetaRemediationPatches(documents)

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        projectId: config.projectId,
        dataset: config.dataset,
        mode: 'dry-run',
        patchCount: patches.length,
        targetDocuments: patches.map((patch) => patch.documentId),
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const transaction = client.transaction()
for (const patch of patches) transaction.patch(patch.documentId, { set: patch.set })
await transaction.commit({ visibility: 'sync' })

const verified = await client.fetch<
  Array<{ _id: string; metaDescription?: string; metaTitle?: string }>
>(`*[_id in $ids]{_id, "metaDescription": seo.metaDescription, "metaTitle": seo.metaTitle}`, {
  ids,
})
for (const target of AHREFS_META_DESCRIPTION_TARGETS) {
  const document = verified.find((item) => item._id === target.documentId)
  if (target.metaDescription && document?.metaDescription !== target.metaDescription) {
    throw new Error(`Meta description verification failed: ${target.documentId}`)
  }
  if (target.metaTitle && document?.metaTitle !== target.metaTitle) {
    throw new Error(`Meta title verification failed: ${target.documentId}`)
  }
}

console.log(
  JSON.stringify(
    {
      projectId: config.projectId,
      dataset: config.dataset,
      mode: 'apply',
      patchCount: patches.length,
    },
    null,
    2,
  ),
)
