export type RawDocument = Record<string, any> & {
  _id: string
  _type: string
  _updatedAt?: string
}

export type RawSnapshot = {
  siteSettings: RawDocument
  homePage: RawDocument
  aboutPage: RawDocument
  contactPage: RawDocument
  services: RawDocument[]
  areas: RawDocument[]
  serviceAreaLandings: RawDocument[]
  projects: RawDocument[]
  categories: RawDocument[]
  posts: RawDocument[]
  redirects: RawDocument[]
  videos?: RawDocument[]
}

const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage', 'contactPage'] as const
const COLLECTIONS = [
  'services',
  'areas',
  'serviceAreaLandings',
  'projects',
  'categories',
  'posts',
  'redirects',
] as const

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function validateRawSnapshot(value: unknown): RawSnapshot {
  if (!isRecord(value)) throw new Error('Content snapshot must be an object')

  for (const name of SINGLETONS) {
    if (!isRecord(value[name])) throw new Error(`Missing singleton: ${name}`)
  }
  for (const name of COLLECTIONS) {
    if (!Array.isArray(value[name])) throw new Error(`Missing collection: ${name}`)
  }

  return value as RawSnapshot
}
