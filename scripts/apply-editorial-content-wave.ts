import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getCliClient } from 'sanity/cli'

import {
  EDITORIAL_ARTICLE_RELATIONS,
  EDITORIAL_CONTENT_WAVE_KEYS,
} from '../content/sorouh/seo/editorial-content-wave'
import { sorouhSemanticMediaPlan } from '../content/sorouh/semantic-media-plan'
import { articles, siteCopy } from '../content/sorouh/site-content'
import { buildEditorialContentWave } from './lib/build-editorial-content-wave'
import { buildManagedContentImage } from './lib/build-semantic-media-patches'

const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const dryRun = process.argv.includes('--dry-run')
const apply = process.argv.includes('--apply')

if (dryRun === apply) throw new Error('Choose exactly one mode: --dry-run or --apply')

const client = getCliClient({ apiVersion: '2026-08-13' }).withConfig({ dataset: DATASET })
const config = client.config()
if (config.projectId !== EXPECTED_PROJECT_ID || config.dataset !== DATASET) {
  throw new Error(
    `Refusing editorial content wave: expected ${EXPECTED_PROJECT_ID}/${DATASET}, received ${config.projectId}/${config.dataset}`,
  )
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const selectedKeys = new Set<string>(EDITORIAL_CONTENT_WAVE_KEYS)
const selectedArticles = articles.filter((article) => selectedKeys.has(article.key))
if (selectedArticles.length !== EDITORIAL_CONTENT_WAVE_KEYS.length) {
  throw new Error('Editorial source is missing one or more approved article records')
}

const placements = new Map(
  selectedArticles.map((article) => {
    const placement = sorouhSemanticMediaPlan.placements.find(
      (item) => item.target === `post-${article.key}`,
    )
    if (!placement) throw new Error(`Missing semantic media placement: post-${article.key}`)
    return [article.key, placement] as const
  }),
)
const assets = new Map(sorouhSemanticMediaPlan.assets.map((asset) => [asset.key, asset]))
const selectedAssets = selectedArticles.map((article) => {
  const placement = placements.get(article.key)!
  const asset = assets.get(placement.assetKey)
  if (!asset) throw new Error(`Missing semantic media asset: ${placement.assetKey}`)
  return asset
})

const serviceKeys = [
  ...new Set(Object.values(EDITORIAL_ARTICLE_RELATIONS).flatMap((item) => item.serviceKeys)),
]
const categoryKeys = [...new Set(selectedArticles.map((article) => article.categoryKey))]
const areaKeys = [...new Set(selectedArticles.map((article) => article.areaKey))]
const relatedPostKeys = [
  ...new Set(Object.values(EDITORIAL_ARTICLE_RELATIONS).flatMap((item) => item.relatedPostKeys)),
]
const newPostIds = new Set(selectedArticles.map((article) => `post-${article.key}`))
const existingRelatedPostIds = relatedPostKeys
  .map((key) => `post-${key}`)
  .filter((id) => !newPostIds.has(id))

const [categories, areas, services, existingPostIds, existingRelatedPostIdsFound, files] =
  await Promise.all([
    client.fetch<Array<{ _id: string }>>(`*[_id in $ids && !(_id in path("drafts.**"))]{_id}`, {
      ids: categoryKeys.map((key) => `category-${key}`),
    }),
    client.fetch<Array<{ _id: string }>>(`*[_id in $ids && !(_id in path("drafts.**"))]{_id}`, {
      ids: areaKeys.map((key) => `area-${key}`),
    }),
    client.fetch<Array<{ _id: string }>>(`*[_id in $ids && !(_id in path("drafts.**"))]{_id}`, {
      ids: serviceKeys.map((key) => `service-${key}`),
    }),
    client.fetch<string[]>(`*[_type == "post" && !(_id in path("drafts.**"))]._id`),
    client.fetch<string[]>(`*[_id in $ids && !(_id in path("drafts.**"))]._id`, {
      ids: existingRelatedPostIds,
    }),
    Promise.all(selectedAssets.map((asset) => readFile(resolve(root, asset.path)))),
  ])

if (categories.length !== categoryKeys.length)
  throw new Error('Missing editorial category document')
if (areas.length !== areaKeys.length) throw new Error('Missing editorial area document')
if (services.length !== serviceKeys.length) throw new Error('Missing editorial service document')
if (existingRelatedPostIdsFound.length !== existingRelatedPostIds.length) {
  throw new Error('Missing published related editorial post')
}

const categoryIds = new Map(
  categories.map((item) => [item._id.replace(/^category-/, ''), item._id]),
)
const areaIds = new Map(areas.map((item) => [item._id.replace(/^area-/, ''), item._id]))
const serviceIds = new Map(services.map((item) => [item._id.replace(/^service-/, ''), item._id]))
const postIds = new Map(relatedPostKeys.map((key) => [key, `post-${key}`]))
const existingEditorialIds = new Set(
  selectedArticles
    .map((article) => `post-${article.key}`)
    .filter((id) => existingPostIds.includes(id)),
)

const imageIds = new Map<string, string>()
if (apply) {
  for (const [index, asset] of selectedAssets.entries()) {
    const buffer = files[index]!
    const sha1hash = createHash('sha1').update(buffer).digest('hex')
    const existing = await client.fetch<string | null>(
      `*[_type == "sanity.imageAsset" && sha1hash == $sha1hash][0]._id`,
      { sha1hash },
    )
    const id =
      existing ??
      (
        await client.assets.upload('image', buffer, {
          filename: basename(asset.path),
          label: `sorouh-editorial:${asset.key}`,
        })
      )._id
    imageIds.set(asset.key, id)
  }
}

const images = new Map(
  selectedArticles.map((article) => {
    const placement = placements.get(article.key)!
    const assetId = imageIds.get(placement.assetKey) ?? `dry-run-${placement.assetKey}`
    return [article.key, buildManagedContentImage(placement, assetId)] as const
  }),
)
const plan = buildEditorialContentWave({
  articles: selectedArticles,
  relations: new Map(Object.entries(EDITORIAL_ARTICLE_RELATIONS)),
  categoryIds,
  areaIds,
  serviceIds,
  postIds,
  images,
  // This publisher owns these five IDs and is intentionally idempotent: a rerun
  // synchronizes their source content rather than creating a competing article.
  existingIds: new Set(),
  author: siteCopy.companyName,
})

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        projectId: config.projectId,
        dataset: config.dataset,
        mode: 'dry-run',
        creates: plan.creates
          .map((document) => document._id as string)
          .filter((id) => !existingEditorialIds.has(id)),
        updates: plan.creates
          .map((document) => document._id as string)
          .filter((id) => existingEditorialIds.has(id)),
        assets: selectedAssets.map((asset) => asset.key),
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const transaction = client.transaction()
for (const document of plan.creates) {
  if (existingEditorialIds.has(document._id as string)) transaction.createOrReplace(document as any)
  else transaction.create(document as any)
}
await transaction.commit({ visibility: 'sync' })

const createdIds = plan.creates.map((document) => document._id as string)
const verified = await client.fetch<
  Array<{
    _id: string
    title?: string
    slug?: { current?: string }
    categoryId?: string
    areaId?: string
  }>
>(`*[_id in $ids]{_id, title, slug, "categoryId": category._ref, "areaId": serviceArea._ref}`, {
  ids: createdIds,
})
for (const document of plan.creates) {
  const actual = verified.find((item) => item._id === document._id)
  const slug = document.slug as { current?: string }
  const category = document.category as { _ref?: string }
  const area = document.serviceArea as { _ref?: string }
  if (
    !actual ||
    actual.title !== document.title ||
    actual.slug?.current !== slug.current ||
    actual.categoryId !== category._ref ||
    actual.areaId !== area._ref
  ) {
    throw new Error(`Editorial content verification failed: ${document._id}`)
  }
}

console.log(
  JSON.stringify(
    {
      projectId: config.projectId,
      dataset: config.dataset,
      mode: 'apply',
      createdDocuments: plan.creates.filter(
        (document) => !existingEditorialIds.has(document._id as string),
      ).length,
      updatedDocuments: plan.creates.filter((document) =>
        existingEditorialIds.has(document._id as string),
      ).length,
      verifiedDocuments: verified.length,
      assets: selectedAssets.length,
    },
    null,
    2,
  ),
)
