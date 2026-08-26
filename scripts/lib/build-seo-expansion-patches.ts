export type ServiceReference = {
  _type: 'reference'
  _ref: string
  _key: string
}

type ExistingReference = { _ref?: string; _key?: string } | undefined
type ManagedDocument = {
  _id: string
  featuredServices?: ExistingReference[]
}

export type ManagedPatch = {
  documentId: string
  set: { featuredServices: ServiceReference[] }
}

export function mergeFeaturedServices(
  existing: ExistingReference[] = [],
  reviewedIds: string[],
): ServiceReference[] {
  const refs: ServiceReference[] = []
  const seen = new Set<string>()
  for (const reference of existing) {
    const id = reference?._ref
    if (!id || seen.has(id)) continue
    seen.add(id)
    refs.push({ _type: 'reference', _ref: id, _key: reference._key ?? id })
  }
  for (const id of reviewedIds) {
    if (seen.has(id)) continue
    seen.add(id)
    refs.push({ _type: 'reference', _ref: id, _key: id })
  }
  return refs
}

export function buildSeoExpansionPatches(input: {
  homePage: ManagedDocument
  areas: ManagedDocument[]
  featuredServiceIds: string[]
}): ManagedPatch[] {
  const documents = [input.homePage, ...input.areas]
  return documents.map((document) => ({
    documentId: document._id,
    set: {
      featuredServices: mergeFeaturedServices(document.featuredServices, input.featuredServiceIds),
    },
  }))
}
