import type { NormalizedSnapshot } from './normalize'

function isText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function isRecord(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0
}

function requireValue(path: string, value: unknown, kind: 'text' | 'record' | 'items') {
  const valid =
    kind === 'text' ? isText(value) : kind === 'record' ? isRecord(value) : isItems(value)
  if (!valid) throw new Error(`Published content is missing render field: ${path}`)
}

function requireSeo(path: string, document: Record<string, any>) {
  requireValue(`${path}.seo`, document.seo, 'record')
  requireValue(`${path}.seo.metaTitle`, document.seo.metaTitle, 'text')
  requireValue(`${path}.seo.metaDescription`, document.seo.metaDescription, 'text')
}

function requireDocument(
  path: string,
  document: Record<string, any>,
  text: string[],
  records: string[],
  arrays: string[],
) {
  for (const field of text) requireValue(`${path}.${field}`, document[field], 'text')
  for (const field of records) requireValue(`${path}.${field}`, document[field], 'record')
  for (const field of arrays) requireValue(`${path}.${field}`, document[field], 'items')
  requireSeo(path, document)
}

export function validateRenderContract(snapshot: NormalizedSnapshot): NormalizedSnapshot {
  requireDocument(
    'siteSettings',
    snapshot.siteSettings,
    [
      'companyName',
      'shortName',
      'tagline',
      'primaryPhone',
      'backupPhone',
      'availability',
      'rssAuthorEmail',
    ],
    ['defaultShareImage'],
    ['stats'],
  )
  requireDocument(
    'homePage',
    snapshot.homePage,
    ['heroEyebrow', 'heroTitle', 'heroSummary'],
    ['heroImage', 'closingCta'],
    ['introduction', 'featuredServices', 'featuredProjects'],
  )
  requireDocument('aboutPage', snapshot.aboutPage, ['title', 'lead'], ['image'], ['body', 'values'])
  requireDocument(
    'contactPage',
    snapshot.contactPage,
    ['title', 'lead', 'serviceAreaIntro'],
    [],
    ['contactPoints', 'faqs'],
  )

  for (const service of snapshot.services)
    requireDocument(
      `service:${service._id}`,
      service,
      ['title', 'slug', 'summary'],
      ['heroImage'],
      ['body', 'deliverables', 'process', 'faqs'],
    )
  for (const area of snapshot.areas)
    requireDocument(
      `serviceArea:${area._id}`,
      area,
      ['title', 'slug', 'summary'],
      ['image'],
      ['intro', 'featuredServices', 'faqs'],
    )
  for (const project of snapshot.projects)
    requireDocument(
      `project:${project._id}`,
      project,
      ['title', 'slug', 'summary', 'classification', 'result'],
      ['serviceArea'],
      ['workDescription', 'scope', 'stages', 'services'],
    )
  for (const category of snapshot.categories)
    requireDocument(`category:${category._id}`, category, ['title', 'slug', 'description'], [], [])
  for (const post of snapshot.posts)
    requireDocument(
      `post:${post._id}`,
      post,
      ['title', 'slug', 'excerpt', 'publishedAt', 'author', '_updatedAt'],
      ['featuredImage', 'category', 'articleCta'],
      ['body'],
    )

  return snapshot
}
