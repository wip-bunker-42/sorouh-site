import { areas, services } from '../content/sorouh/site-content'
import { SEO_KEYWORD_TARGETS } from '../content/sorouh/seo/keyword-targets'
import { serviceAreaLandings } from '../content/sorouh/service-area-landings'
import { validateKeywordTargets } from './lib/seo-keyword-targets'

const livePaths = new Set<string>([
  '/',
  '/الخدمات/',
  '/مناطق-الخدمة/',
  ...services.map((service) => `/الخدمات/${service.slug}/`),
  ...areas.map((area) => `/مناطق-الخدمة/${area.slug}/`),
])

const serviceSlugs = new Map(services.map((item) => [item.key, item.slug]))
const areaSlugs = new Map(areas.map((item) => [item.key, item.slug]))
for (const landing of serviceAreaLandings) {
  const serviceSlug = serviceSlugs.get(landing.serviceKey)
  const areaSlug = areaSlugs.get(landing.areaKey)
  if (!serviceSlug || !areaSlug) throw new Error(`Unknown local landing relation: ${landing.key}`)
  livePaths.add(`/الخدمات/${serviceSlug}/${areaSlug}/`)
}

const result = validateKeywordTargets(SEO_KEYWORD_TARGETS, livePaths)
console.log(`SEO keyword targets valid: ${result.active} active, ${result.candidates} candidates`)
