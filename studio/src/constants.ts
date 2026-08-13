export const SANITY_API_VERSION = '2026-08-13' as const
export const DATASET = 'production' as const

export const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage', 'contactPage'] as const
export type SingletonType = (typeof SINGLETONS)[number]

export const SINGLETON_IDS = Object.fromEntries(SINGLETONS.map((type) => [type, type])) as Record<
  SingletonType,
  SingletonType
>

export function isSingletonType(schemaType: string): schemaType is SingletonType {
  return SINGLETONS.includes(schemaType as SingletonType)
}

export function filterSingletonActions<T extends { action?: string }>(
  actions: T[],
  schemaType: string,
): T[] {
  if (!isSingletonType(schemaType)) return actions
  return actions.filter((item) => item.action !== 'delete' && item.action !== 'duplicate')
}

export function filterSingletonTemplates<T extends { templateId?: string; schemaType?: string }>(
  templates: T[],
): T[] {
  return templates.filter(
    (item) => !isSingletonType(item.templateId ?? '') && !isSingletonType(item.schemaType ?? ''),
  )
}
