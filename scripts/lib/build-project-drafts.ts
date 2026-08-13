export interface ProjectDraft {
  sourceKey: string
  title: string
  slug: string
  summary: string
  description: string
  classification: string
  serviceKeys: string[]
  areaKey: string
  stages: string[]
  result: string
  mediaKeys: string[]
  youtubeUrl?: string
  seo: { metaTitle: string; metaDescription: string; shareMediaKey: string }
}

export interface ReviewEntry {
  sourceKey: string
  field: 'areaKey' | 'classification' | 'stages' | 'result' | 'date'
  chosenValue: string
  evidence: string[]
  confidence: 'high' | 'medium' | 'low'
}

export interface DraftMedia {
  key: string
  usage: 'brand' | 'project' | 'metadata' | 'excluded'
}

const ARABIC = /[\u0600-\u06ff]/
const REVIEWED_FIELDS = ['areaKey', 'classification', 'stages', 'result'] as const

function requireArabic(project: ProjectDraft, field: keyof ProjectDraft) {
  const value = project[field]
  if (typeof value !== 'string' || !value.trim() || !ARABIC.test(value)) {
    throw new Error(`${project.sourceKey}.${field} must contain Arabic content`)
  }
}

function requireList(project: ProjectDraft, field: 'serviceKeys' | 'stages' | 'mediaKeys') {
  if (!Array.isArray(project[field]) || project[field].length === 0) {
    throw new Error(`${project.sourceKey}.${field} is required`)
  }
}

export function validateProjectDrafts(
  projects: ProjectDraft[],
  reviews: ReviewEntry[],
  assets: DraftMedia[],
) {
  const sourceKeys = new Set<string>()
  const projectAssets = new Set(
    assets.filter((asset) => asset.usage === 'project').map((asset) => asset.key),
  )
  const assignmentCount = new Map<string, number>()

  for (const project of projects) {
    if (sourceKeys.has(project.sourceKey)) {
      throw new Error(`Duplicate project sourceKey: ${project.sourceKey}`)
    }
    sourceKeys.add(project.sourceKey)

    for (const field of ['title', 'summary', 'description', 'classification', 'result'] as const) {
      requireArabic(project, field)
    }
    if (!project.slug.trim()) throw new Error(`${project.sourceKey}.slug is required`)
    if (!project.areaKey.trim()) throw new Error(`${project.sourceKey}.areaKey is required`)
    requireList(project, 'serviceKeys')
    requireList(project, 'stages')
    requireList(project, 'mediaKeys')

    if (!project.seo.metaTitle.trim() || !ARABIC.test(project.seo.metaTitle)) {
      throw new Error(`${project.sourceKey}.seo.metaTitle is required`)
    }
    if (!project.seo.metaDescription.trim() || !ARABIC.test(project.seo.metaDescription)) {
      throw new Error(`${project.sourceKey}.seo.metaDescription is required`)
    }
    if (!project.mediaKeys.includes(project.seo.shareMediaKey)) {
      throw new Error(`${project.sourceKey}.seo.shareMediaKey must reference project media`)
    }

    for (const mediaKey of project.mediaKeys) {
      if (!projectAssets.has(mediaKey)) {
        throw new Error(`${project.sourceKey}.mediaKeys references unknown media: ${mediaKey}`)
      }
      assignmentCount.set(mediaKey, (assignmentCount.get(mediaKey) ?? 0) + 1)
    }

    for (const field of REVIEWED_FIELDS) {
      const review = reviews.find(
        (entry) => entry.sourceKey === project.sourceKey && entry.field === field,
      )
      if (!review || !review.chosenValue.trim() || review.evidence.length === 0) {
        throw new Error(`Missing review entry: ${project.sourceKey}.${field}`)
      }
    }
  }

  const duplicated = [...assignmentCount.entries()].find(([, count]) => count > 1)
  if (duplicated) throw new Error(`Media assigned to multiple projects: ${duplicated[0]}`)

  const unassigned = [...projectAssets].filter((key) => !assignmentCount.has(key))
  if (unassigned.length > 0) throw new Error(`Unassigned project media: ${unassigned.join(', ')}`)

  return {
    projects: projects.length,
    assignedMedia: assignmentCount.size,
    unassignedMedia: 0,
  }
}
