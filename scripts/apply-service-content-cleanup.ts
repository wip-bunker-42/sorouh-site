import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

import {
  buildServiceContentCleanupPlan,
  type CleanupDocument,
  type ServiceContentCleanupPlan,
} from './lib/build-service-content-cleanup'

const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const apply = args.includes('--apply')
if (dryRun === apply) throw new Error('Choose exactly one mode: --dry-run or --apply')
const option = (name: string) => {
  const index = args.indexOf(name)
  if (index < 0) return undefined
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`)
  return value
}
const root = fileURLToPath(new URL('..', import.meta.url))
const inventoryPath = option('--inventory')
const reviewedPlanPath = option('--reviewed-plan')
if (apply && inventoryPath) throw new Error('An offline inventory can only be used with --dry-run')
if (apply && !reviewedPlanPath)
  throw new Error('--apply requires the exact --reviewed-plan written by a dry run')
const outputDirectory = resolve(
  root,
  option('--output') ??
    `work/service-content-cleanup/${new Date().toISOString().replace(/[:.]/g, '-')}`,
)
const client = inventoryPath
  ? undefined
  : (await import('sanity/cli'))
      .getCliClient({ apiVersion: '2026-08-13' })
      .withConfig({ dataset: DATASET, useCdn: false, perspective: 'raw' })
if (
  client &&
  (client.config().projectId !== EXPECTED_PROJECT_ID || client.config().dataset !== DATASET)
) {
  throw new Error(`Refusing cleanup outside ${EXPECTED_PROJECT_ID}/${DATASET}`)
}
// Include drafts so withdrawal cannot overwrite an editor's unpublished work.
const documents = inventoryPath
  ? (JSON.parse(
      (await readFile(resolve(root, inventoryPath), 'utf8')).replace(/^\uFEFF/, ''),
    ) as CleanupDocument[])
  : await client!.fetch<CleanupDocument[]>(
      `*[!(_type in ["sanity.imageAsset", "sanity.fileAsset"]) && !(_id in path("_.**"))] | order(_id asc)`,
    )
const plan = buildServiceContentCleanupPlan(documents)
if (apply) {
  const reviewed = JSON.parse(await readFile(resolve(root, reviewedPlanPath!), 'utf8')) as {
    projectId: string
    dataset: string
    plan: ServiceContentCleanupPlan
  }
  if (
    reviewed.projectId !== EXPECTED_PROJECT_ID ||
    reviewed.dataset !== DATASET ||
    !isDeepStrictEqual(reviewed.plan, plan)
  ) {
    throw new Error(
      'Reviewed plan no longer matches the CMS or source content; run a new dry run and review it',
    )
  }
}
const withdrawnIds = new Set(plan.withdrawals.map((entry) => entry.id))
const preview = documents
  .filter((entry) => !entry._id.startsWith('drafts.') && !withdrawnIds.has(entry._id))
  .map((entry) => {
    const patch = plan.patches.find((item) => item.id === entry._id)
    const projected = { ...entry, ...patch?.set }
    for (const field of patch?.unset ?? []) delete projected[field]
    return projected
  })
await mkdir(outputDirectory, { recursive: true })
// Exclusive creation keeps each review and its originals immutable on disk.
await writeFile(
  resolve(outputDirectory, 'originals.json'),
  JSON.stringify(plan.originals, null, 2),
  { flag: 'wx' },
)
await writeFile(
  resolve(outputDirectory, 'review-plan.json'),
  JSON.stringify(
    {
      projectId: EXPECTED_PROJECT_ID,
      dataset: DATASET,
      generatedAt: new Date().toISOString(),
      plan,
    },
    null,
    2,
  ),
  { flag: 'wx' },
)
await writeFile(
  resolve(outputDirectory, 'preview-documents.json'),
  JSON.stringify(preview, null, 2),
  { flag: 'wx' },
)

if (apply && (plan.patches.length || plan.withdrawals.length)) {
  const transaction = client!.transaction()
  for (const patch of plan.patches)
    transaction.patch(patch.id, {
      ifRevisionID: patch.ifRevisionID,
      set: patch.set,
      ...(patch.unset.length ? { unset: patch.unset } : {}),
    })
  for (const withdrawal of plan.withdrawals) {
    transaction.create(withdrawal.draft as any)
    // Guard the published revision before deleting only its published variant.
    transaction.patch(withdrawal.id, {
      ifRevisionID: withdrawal.ifRevisionID,
      set: { title: withdrawal.draft.title },
    })
    transaction.delete(withdrawal.id)
  }
  await transaction.commit({ visibility: 'sync' })
  const verified = await client!.fetch<CleanupDocument[]>(`*[_id in $ids]`, {
    ids: [
      ...plan.patches.map((entry) => entry.id),
      ...plan.withdrawals.flatMap((entry) => [entry.id, String(entry.draft._id)]),
    ],
  })
  for (const patch of plan.patches) {
    const actual = verified.find((entry) => entry._id === patch.id)
    if (
      !actual ||
      Object.entries(patch.set).some(
        ([field, value]) => !isDeepStrictEqual(actual[field], value),
      ) ||
      patch.unset.some((field) => field in actual)
    )
      throw new Error(`Cleanup verification failed: ${patch.id}`)
  }
  for (const withdrawal of plan.withdrawals)
    if (
      verified.some((entry) => entry._id === withdrawal.id) ||
      !verified.some((entry) => entry._id === withdrawal.draft._id)
    )
      throw new Error(`Withdrawal verification failed: ${withdrawal.id}`)
}
console.log(
  JSON.stringify(
    {
      projectId: EXPECTED_PROJECT_ID,
      dataset: DATASET,
      mode: dryRun ? 'dry-run' : 'apply',
      patches: plan.patches.map((entry) => ({
        id: entry.id,
        fields: [...Object.keys(entry.set), ...entry.unset],
      })),
      withdrawals: plan.withdrawals.map((entry) => ({
        publishedId: entry.id,
        retainedDraftId: entry.draft._id,
      })),
      remainingPublishedCounts: plan.remainingPublishedCounts,
      outputDirectory,
    },
    null,
    2,
  ),
)
