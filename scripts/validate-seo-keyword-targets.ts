import { areas, services } from '../content/sorouh/site-content'
import { SEO_KEYWORD_TARGETS } from '../content/sorouh/seo/keyword-targets'
import { validateKeywordTargets } from './lib/seo-keyword-targets'

const livePaths = new Set<string>([
  '/',
  '/الخدمات/',
  '/مناطق-الخدمة/',
  ...services.map((service) => `/الخدمات/${service.slug}/`),
  ...areas.map((area) => `/مناطق-الخدمة/${area.slug}/`),
])

const result = validateKeywordTargets(SEO_KEYWORD_TARGETS, livePaths)
console.log(`SEO keyword targets valid: ${result.active} active, ${result.candidates} candidates`)
