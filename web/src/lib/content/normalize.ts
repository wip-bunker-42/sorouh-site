import type { RawDocument, RawSnapshot } from './validate'

type NormalizedDocument = RawDocument & {
  slug?: string
  seo: Record<string, any> & {
    metaTitle: string
    metaDescription: string
    noIndex: boolean
    canonicalOverride?: string
    shareImage?: Record<string, any>
  }
}

export type NormalizedSnapshot = Omit<
  RawSnapshot,
  | 'siteSettings'
  | 'homePage'
  | 'aboutPage'
  | 'contactPage'
  | 'services'
  | 'areas'
  | 'projects'
  | 'categories'
  | 'posts'
> & {
  siteSettings: NormalizedDocument
  homePage: NormalizedDocument
  aboutPage: NormalizedDocument
  contactPage: NormalizedDocument
  services: NormalizedDocument[]
  areas: NormalizedDocument[]
  projects: NormalizedDocument[]
  categories: NormalizedDocument[]
  posts: NormalizedDocument[]
  videos: RawDocument[]
  warnings: string[]
  aggregateLastmod: Record<string, never>
}

function publishedOnly(documents: RawDocument[]): RawDocument[] {
  return documents.filter((document) => !document._id.startsWith('drafts.'))
}

function slugValue(document: RawDocument): string | undefined {
  if (typeof document.slug === 'string') return document.slug
  if (document.slug && typeof document.slug.current === 'string') return document.slug.current
  return undefined
}

function firstText(...values: unknown[]): string {
  return values.find(hasText)?.toString().trim() ?? 'صفحة الموقع'
}

function inferredImage(document: RawDocument, defaultImage?: Record<string, any>) {
  return (
    document.seo?.shareImage ??
    document.heroImage ??
    document.image ??
    document.featuredImage ??
    document.gallery?.[0] ??
    defaultImage
  )
}

function normalizeDocument(
  document: RawDocument,
  defaultImage?: Record<string, any>,
): NormalizedDocument {
  const metaTitle = firstText(
    document.seo?.metaTitle,
    document.title,
    document.heroTitle,
    document.companyName,
  )
  const metaDescription = firstText(
    document.seo?.metaDescription,
    document.summary,
    document.excerpt,
    document.lead,
    document.heroSummary,
    document.tagline,
    metaTitle,
  )
  return {
    ...document,
    slug: slugValue(document),
    seo: {
      ...(document.seo ?? {}),
      metaTitle,
      metaDescription,
      noIndex: Boolean(document.seo?.noIndex),
      shareImage: inferredImage(document, defaultImage),
    },
  }
}

function assertUniqueSlugs(type: string, documents: NormalizedDocument[]): void {
  const seen = new Set<string>()
  for (const document of documents) {
    if (!document.slug) continue
    if (seen.has(document.slug)) throw new Error(`Duplicate ${type} slug: ${document.slug}`)
    seen.add(document.slug)
  }
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0
}

function referenceId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const reference = value as { _id?: string; _ref?: string }
  return reference._id ?? reference._ref
}

function validateProject(
  project: NormalizedDocument,
  serviceIds: Set<string>,
  areaIds: Set<string>,
): void {
  const missing: string[] = []
  if (!hasText(project.title)) missing.push('title')
  if (!hasText(project.slug)) missing.push('slug')
  if (!hasText(project.summary)) missing.push('summary')
  if (!hasItems(project.workDescription)) missing.push('workDescription')
  if (!hasText(project.classification)) missing.push('classification')

  const serviceReferences = Array.isArray(project.services) ? project.services : []
  if (
    serviceReferences.length === 0 ||
    serviceReferences.some((reference) => !serviceIds.has(referenceId(reference) ?? ''))
  ) {
    missing.push('services')
  }

  if (!areaIds.has(referenceId(project.serviceArea) ?? '')) missing.push('serviceArea')
  if (!hasText(project.result)) missing.push('result')
  if (!hasItems(project.gallery) && !hasItems(project.videos)) missing.push('media')

  if (missing.length > 0) {
    const sourceKey = hasText(project.sourceKey) ? project.sourceKey : project._id
    throw new Error(`Project ${sourceKey} is incomplete: ${missing.join(', ')}`)
  }
}

function collectVideos(projects: NormalizedDocument[], extra: RawDocument[] = []): RawDocument[] {
  const videos = [...extra]
  for (const project of projects) {
    if (Array.isArray(project.videos)) videos.push(...project.videos)
  }
  const seen = new Set<string>()
  return videos.filter((video) => {
    if (!hasText(video.url) || seen.has(video.url)) return false
    seen.add(video.url)
    return true
  })
}

export function normalizeSnapshot(raw: RawSnapshot, now = new Date()): NormalizedSnapshot {
  const siteSettings = normalizeDocument(raw.siteSettings)
  const defaultImage = siteSettings.defaultShareImage
  const homePage = normalizeDocument(raw.homePage, defaultImage)
  const aboutPage = normalizeDocument(raw.aboutPage, defaultImage)
  const contactPage = normalizeDocument(raw.contactPage, defaultImage)
  const services = publishedOnly(raw.services).map((document) =>
    normalizeDocument(document, defaultImage),
  )
  const areas = publishedOnly(raw.areas).map((document) =>
    normalizeDocument(document, defaultImage),
  )
  const projects = publishedOnly(raw.projects).map((document) =>
    normalizeDocument(document, defaultImage),
  )
  const categories = publishedOnly(raw.categories).map((document) =>
    normalizeDocument(document, defaultImage),
  )
  const posts = publishedOnly(raw.posts)
    .filter((document) => hasText(document.publishedAt) && new Date(document.publishedAt) <= now)
    .map((document) => normalizeDocument(document, defaultImage))
  const redirects = publishedOnly(raw.redirects)

  assertUniqueSlugs('service', services)
  assertUniqueSlugs('serviceArea', areas)
  assertUniqueSlugs('project', projects)
  assertUniqueSlugs('category', categories)
  assertUniqueSlugs('post', posts)

  const serviceIds = new Set(services.map((document) => document._id))
  const areaIds = new Set(areas.map((document) => document._id))
  const categoryIds = new Set(categories.map((document) => document._id))
  const postIds = new Set(posts.map((document) => document._id))
  const warnings: string[] = []

  for (const project of projects) validateProject(project, serviceIds, areaIds)

  for (const post of posts) {
    const categoryId = referenceId(post.category)
    if (!categoryId || !categoryIds.has(categoryId)) {
      throw new Error(`Post ${post._id} is missing required category reference`)
    }

    const areaId = referenceId(post.serviceArea)
    if (areaId && !areaIds.has(areaId)) {
      warnings.push(`post ${post._id} references missing optional area ${areaId}`)
    }

    for (const related of Array.isArray(post.relatedPosts) ? post.relatedPosts : []) {
      const relatedId = referenceId(related)
      if (relatedId && !postIds.has(relatedId)) {
        warnings.push(`post ${post._id} references missing optional post ${relatedId}`)
      }
    }
  }

  return {
    ...raw,
    siteSettings,
    homePage,
    aboutPage,
    contactPage,
    services,
    areas,
    projects,
    categories,
    posts,
    redirects,
    videos: collectVideos(projects, raw.videos),
    warnings,
    aggregateLastmod: {},
  }
}
