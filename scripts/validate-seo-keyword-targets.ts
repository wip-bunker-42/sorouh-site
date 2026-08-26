import { areas, services } from '../content/sorouh/site-content'
import { keywordContentWave } from '../content/sorouh/seo/keyword-content-wave'
import { SEO_KEYWORD_TARGETS } from '../content/sorouh/seo/keyword-targets'
import { serviceAreaLandings } from '../content/sorouh/service-area-landings'
import { getServiceAreaRoutes } from './lib/keyword-owner-routes'
import { validateKeywordTargets } from './lib/seo-keyword-targets'

const livePaths = new Set<string>([
  '/',
  '/الخدمات/',
  '/مناطق-الخدمة/',
  ...services.map((service) => `/الخدمات/${service.slug}/`),
  ...areas.map((area) => `/مناطق-الخدمة/${area.slug}/`),
])

for (const route of getServiceAreaRoutes(services, areas, [
  ...serviceAreaLandings,
  ...keywordContentWave,
])) {
  livePaths.add(route)
}

const result = validateKeywordTargets(SEO_KEYWORD_TARGETS, livePaths)
console.log(`SEO keyword targets valid: ${result.active} active, ${result.candidates} candidates`)
