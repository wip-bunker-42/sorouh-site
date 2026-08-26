type SluggedRecord = { key: string; slug: string }
type ServiceAreaRelation = { key: string; serviceKey: string; areaKey: string }

export function getServiceAreaRoutes(
  services: readonly SluggedRecord[],
  areas: readonly SluggedRecord[],
  landings: readonly ServiceAreaRelation[],
): Set<string> {
  const serviceSlugs = new Map(services.map((item) => [item.key, item.slug]))
  const areaSlugs = new Map(areas.map((item) => [item.key, item.slug]))
  const routes = new Set<string>()

  for (const landing of landings) {
    const serviceSlug = serviceSlugs.get(landing.serviceKey)
    const areaSlug = areaSlugs.get(landing.areaKey)
    if (!serviceSlug || !areaSlug) {
      throw new Error(`Unknown local landing relation: ${landing.key}`)
    }
    routes.add(`/الخدمات/${serviceSlug}/${areaSlug}/`)
  }

  return routes
}
