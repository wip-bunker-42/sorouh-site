import type { SemanticMediaPlan } from '../../scripts/lib/semantic-media'

import { keywordContentWave } from './seo/keyword-content-wave'
import { serviceAreaLandings } from './service-area-landings'
import { areas, articles, SERVICE_KEYS, services } from './site-content'

const mediaDirectory = 'content/sorouh/semantic-media'
const sourceDirectory = 'content/sorouh/semantic-media/source'

export const expectedSemanticMediaTargets = [
  'homePage',
  'aboutPage',
  ...services.map((service) => `service-${service.key}`),
  ...areas.map((area) => `area-${area.key}`),
  ...serviceAreaLandings.map((landing) => `service-area-${landing.key}`),
  ...keywordContentWave.map((landing) => `service-area-${landing.key}`),
  ...articles.map((article) => `post-${article.key}`),
  'project-sorouh-building-plastering-01',
]

export const sorouhSemanticMediaPlan: SemanticMediaPlan = {
  assets: [
    {
      key: 'generated-home-general-contracting',
      origin: 'generated',
      path: `${mediaDirectory}/home-general-contracting.webp`,
      topics: ['general-contracting', 'contractor-selection'],
    },
    {
      key: 'generated-about-site-team',
      origin: 'generated',
      path: `${mediaDirectory}/about-site-team.webp`,
      topics: ['company-team'],
    },
    {
      key: 'generated-service-general-contracting',
      origin: 'generated',
      path: `${mediaDirectory}/service-general-contracting.webp`,
      topics: ['general-contracting'],
    },
    {
      key: 'generated-home-villa-finishing',
      origin: 'generated',
      path: `${mediaDirectory}/home-villa-finishing.webp`,
      topics: ['home-villa-finishing'],
    },
    {
      key: 'generated-building-contractor',
      origin: 'generated',
      path: `${mediaDirectory}/building-contractor.webp`,
      topics: ['building-contractor'],
    },
    {
      key: 'generated-plastering',
      origin: 'generated',
      path: `${mediaDirectory}/plastering.webp`,
      topics: ['plastering'],
    },
    {
      key: 'generated-helicopter-screed',
      origin: 'generated',
      path: `${mediaDirectory}/helicopter-screed.webp`,
      topics: ['helicopter-screed'],
    },
    {
      key: 'generated-interior-exterior-painting',
      origin: 'generated',
      path: `${mediaDirectory}/interior-exterior-painting.webp`,
      topics: ['interior-exterior-painting'],
    },
    {
      key: 'generated-roof-insulation',
      origin: 'generated',
      path: `${mediaDirectory}/roof-insulation.webp`,
      topics: ['roof-insulation'],
    },
    {
      key: 'generated-water-leak-detection',
      origin: 'generated',
      path: `${mediaDirectory}/water-leak-detection.webp`,
      topics: ['water-leak-detection'],
    },
    {
      key: 'generated-annex-construction',
      origin: 'generated',
      path: `${mediaDirectory}/annex-construction.webp`,
      topics: ['annex-construction'],
    },
    {
      key: 'generated-demolition-removal',
      origin: 'generated',
      path: `${mediaDirectory}/demolition-removal.webp`,
      topics: ['demolition-removal'],
    },
    {
      key: 'generated-area-urban-residential',
      origin: 'generated',
      path: `${mediaDirectory}/area-urban-residential.webp`,
      topics: ['service-area-urban'],
    },
    {
      key: 'generated-area-industrial-residential',
      origin: 'generated',
      path: `${mediaDirectory}/area-industrial-residential.webp`,
      topics: ['service-area-industrial'],
    },
    {
      key: 'generated-area-eastern-coverage',
      origin: 'generated',
      path: `${mediaDirectory}/area-eastern-coverage.webp`,
      topics: ['service-area-eastern'],
    },
    {
      key: 'generated-blog-concrete-comparison',
      origin: 'generated',
      path: `${mediaDirectory}/blog-concrete-comparison.webp`,
      topics: ['concrete-comparison'],
    },
    {
      key: 'generated-blog-roof-insulation-guide',
      origin: 'generated',
      path: `${mediaDirectory}/blog-roof-insulation-guide.webp`,
      topics: ['roof-insulation-guide'],
    },
    {
      key: 'generated-blog-water-leak-guide',
      origin: 'generated',
      path: `${mediaDirectory}/blog-water-leak-guide.webp`,
      topics: ['water-leak-guide'],
    },
    {
      key: 'generated-blog-gypsum-board-planning',
      origin: 'generated',
      path: `${mediaDirectory}/blog-gypsum-board-planning.webp`,
      topics: ['gypsum-board-planning'],
    },
    {
      key: 'generated-blog-wall-preparation-painting',
      origin: 'generated',
      path: `${mediaDirectory}/blog-wall-preparation-painting.webp`,
      topics: ['wall-preparation-painting'],
    },
    {
      key: 'generated-blog-annex-construction-checklist',
      origin: 'generated',
      path: `${mediaDirectory}/blog-annex-construction-checklist.webp`,
      topics: ['annex-construction-checklist'],
    },
    {
      key: 'building-plastering-video-still',
      origin: 'video-still',
      path: `${mediaDirectory}/building-plastering-video-still.webp`,
      topics: ['building-plastering-project'],
    },
    {
      key: 'electrical-video-still',
      origin: 'video-still',
      path: `${mediaDirectory}/electrical-video-still.webp`,
      topics: ['electrical', 'mep'],
    },
    {
      key: 'source-restoration-old-villa',
      origin: 'source',
      path: `${sourceDirectory}/restoration-old-villa.jpeg`,
      topics: ['home-villa-renovation'],
    },
    {
      key: 'source-concrete-saw',
      origin: 'source',
      path: `${sourceDirectory}/concrete-saw-eastern.jpeg`,
      topics: ['concrete-cutting'],
    },
    {
      key: 'source-core-drilling',
      origin: 'source',
      path: `${sourceDirectory}/core-openings.jpeg`,
      topics: ['core-drilling'],
    },
    {
      key: 'source-plumbing',
      origin: 'source',
      path: `${sourceDirectory}/plumbing-network.jpeg`,
      topics: ['plumbing'],
    },
    {
      key: 'source-porcelain',
      origin: 'source',
      path: `${sourceDirectory}/porcelain-dammam.jpeg`,
      topics: ['tile-porcelain'],
    },
    {
      key: 'source-gypsum-board',
      origin: 'source',
      path: `${sourceDirectory}/gypsum-board.jpeg`,
      topics: ['gypsum-board'],
    },
  ],
  placements: [
    {
      target: 'homePage',
      role: 'page',
      assetKey: 'generated-home-general-contracting',
      topic: 'general-contracting',
      alt: 'موقع إنشاء فيلا حديثة تنفذ فيه أعمال المقاولات العامة في المنطقة الشرقية',
    },
    {
      target: 'aboutPage',
      role: 'page',
      assetKey: 'generated-about-site-team',
      topic: 'company-team',
      alt: 'فريق إشراف مقاولات يراجع مخططات التنفيذ داخل موقع سكني',
    },
    {
      target: `service-${SERVICE_KEYS.general}`,
      role: 'service',
      assetKey: 'generated-service-general-contracting',
      topic: 'general-contracting',
      alt: 'تنفيذ متكامل لأعمال مقاولات في مشروع فيلا سكنية بالشرقية',
    },
    {
      target: `service-${SERVICE_KEYS.restoration}`,
      role: 'service',
      assetKey: 'source-restoration-old-villa',
      topic: 'home-villa-renovation',
      alt: 'أعمال ترميم وتجديد منفذة داخل فيلا قديمة في الدمام والخبر',
    },
    {
      target: `service-${SERVICE_KEYS.finishing}`,
      role: 'service',
      assetKey: 'generated-home-villa-finishing',
      topic: 'home-villa-finishing',
      alt: 'تشطيبات داخلية متكاملة لفيلا حديثة بخامات متناسقة',
    },
    {
      target: `service-${SERVICE_KEYS.builder}`,
      role: 'service',
      assetKey: 'generated-building-contractor',
      topic: 'building-contractor',
      alt: 'مقاول بناء يشرف على تنفيذ الهيكل الإنشائي لفيلا سكنية',
    },
    {
      target: `service-${SERVICE_KEYS.plastering}`,
      role: 'service',
      assetKey: 'generated-plastering',
      topic: 'plastering',
      alt: 'تنفيذ اللياسة وضبط استقامة جدار خارجي في مبنى سكني',
    },
    {
      target: `service-${SERVICE_KEYS.concreteSaw}`,
      role: 'service',
      assetKey: 'source-concrete-saw',
      topic: 'concrete-cutting',
      alt: 'قص جدار خرساني بمنشار ماسي داخل مشروع في المنطقة الشرقية',
    },
    {
      target: `service-${SERVICE_KEYS.core}`,
      role: 'service',
      assetKey: 'source-core-drilling',
      topic: 'core-drilling',
      alt: 'تنفيذ فتحات كور للتمديدات في جدار خرساني بالدمام والخبر',
    },
    {
      target: `service-${SERVICE_KEYS.helicopter}`,
      role: 'service',
      assetKey: 'generated-helicopter-screed',
      topic: 'helicopter-screed',
      alt: 'تنعيم صبة خرسانية بالمروحية داخل ساحة مشروع واسعة',
    },
    {
      target: `service-${SERVICE_KEYS.electrical}`,
      role: 'service',
      assetKey: 'electrical-video-still',
      topic: 'electrical',
      alt: 'تأسيس مواسير ولوحة الكهرباء داخل فيلا في الدمام',
    },
    {
      target: `service-${SERVICE_KEYS.plumbing}`,
      role: 'service',
      assetKey: 'source-plumbing',
      topic: 'plumbing',
      alt: 'تأسيس شبكة التغذية والصرف داخل فيلا سكنية في الدمام',
    },
    {
      target: `service-${SERVICE_KEYS.painting}`,
      role: 'service',
      assetKey: 'generated-interior-exterior-painting',
      topic: 'interior-exterior-painting',
      alt: 'تنفيذ دهانات داخلية دقيقة في فيلا حديثة بالمنطقة الشرقية',
    },
    {
      target: `service-${SERVICE_KEYS.tile}`,
      role: 'service',
      assetKey: 'source-porcelain',
      topic: 'tile-porcelain',
      alt: 'تشطيب حمام ببورسلان رخامي ذهبي منفذ في الدمام',
    },
    {
      target: `service-${SERVICE_KEYS.gypsum}`,
      role: 'service',
      assetKey: 'source-gypsum-board',
      topic: 'gypsum-board',
      alt: 'سقف جبس بورد مقاوم للرطوبة منفذ في المنطقة الشرقية',
    },
    {
      target: `service-${SERVICE_KEYS.annexConstruction}`,
      role: 'service',
      assetKey: 'generated-annex-construction',
      topic: 'annex-construction',
      alt: 'ملحق سكني تحت البناء بجوار فيلا مع فتحات وتمديدات مرتبة',
    },
    {
      target: `service-${SERVICE_KEYS.demolition}`,
      role: 'service',
      assetKey: 'generated-demolition-removal',
      topic: 'demolition-removal',
      alt: 'هدم داخلي منظم ورفع مخلفات ضمن مشروع ترميم سكني',
    },
    ...areas.map((area) => {
      const industrial = ['jubail', 'ras-tanura', 'buqayq'].includes(area.key)
      const eastern = ['eastern-province', 'ahsa'].includes(area.key)
      const assetKey = industrial
        ? 'generated-area-industrial-residential'
        : eastern
          ? 'generated-area-eastern-coverage'
          : 'generated-area-urban-residential'
      const topic = industrial
        ? 'service-area-industrial'
        : eastern
          ? 'service-area-eastern'
          : 'service-area-urban'

      return {
        target: `area-${area.key}`,
        role: 'area' as const,
        assetKey,
        topic,
        alt: `خدمات المقاولات للمنازل والفلل في ${area.title}`,
      }
    }),
    {
      target: 'post-choose-contractor',
      role: 'post',
      assetKey: 'generated-home-general-contracting',
      topic: 'contractor-selection',
      alt: 'موقع مشروع سكني منظم يساعد على تقييم جودة مقاول البناء',
    },
    {
      target: 'post-villa-restoration-plan',
      role: 'post',
      assetKey: 'source-restoration-old-villa',
      topic: 'home-villa-renovation',
      alt: 'مرحلة عملية من ترميم وتجديد فيلا قديمة في المنطقة الشرقية',
    },
    {
      target: 'post-concrete-cutting-guide',
      role: 'post',
      assetKey: 'generated-blog-concrete-comparison',
      topic: 'concrete-comparison',
      alt: 'مقارنة بصرية بين قص الخرسانة بالمنشار وتنفيذ فتحة كور',
    },
    {
      target: 'post-mep-before-finishing',
      role: 'post',
      assetKey: 'electrical-video-still',
      topic: 'mep',
      alt: 'تمديدات الكهرباء داخل فيلا قبل إغلاق مراحل التشطيب',
    },
    {
      target: 'post-porcelain-installation',
      role: 'post',
      assetKey: 'source-porcelain',
      topic: 'tile-porcelain',
      alt: 'تفاصيل تشطيب حمام ببورسلان رخامي ذهبي في الدمام',
    },
    {
      target: 'post-water-leak-before-renovation',
      role: 'post',
      assetKey: 'generated-blog-water-leak-guide',
      topic: 'water-leak-guide',
      alt: 'فحص نقطة وصول لتمديدات مياه خلف جدار حمام مع أثر رطوبة محدود',
    },
    {
      target: 'post-gypsum-board-planning',
      role: 'post',
      assetKey: 'generated-blog-gypsum-board-planning',
      topic: 'gypsum-board-planning',
      alt: 'هيكل سقف جبس بورد مكشوف مع مسارات إنارة وخدمات مرتبة قبل الإغلاق',
    },
    {
      target: 'post-wall-preparation-before-painting',
      role: 'post',
      assetKey: 'generated-blog-wall-preparation-painting',
      topic: 'wall-preparation-painting',
      alt: 'تجهيز جدار داخلي بالمعجون والحماية قبل تطبيق الدهان',
    },
    {
      target: 'post-annex-construction-checklist',
      role: 'post',
      assetKey: 'generated-blog-annex-construction-checklist',
      topic: 'annex-construction-checklist',
      alt: 'أساسات ومباني ملحق سكني بجوار فيلا مع مسارات خدمات ظاهرة قبل الإغلاق',
    },
    {
      target: 'project-sorouh-building-plastering-01',
      role: 'project',
      assetKey: 'building-plastering-video-still',
      topic: 'building-plastering-project',
      alt: 'أعمال بناء ولياسة حقيقية موثقة من مشروع صروح الشرقية',
    },
  ],
}

const servicePlacements = new Map(
  sorouhSemanticMediaPlan.placements
    .filter((placement) => placement.role === 'service')
    .map((placement) => [placement.target, placement]),
)
const managedServiceAreaLandings = [...serviceAreaLandings, ...keywordContentWave]

sorouhSemanticMediaPlan.placements.push(
  ...managedServiceAreaLandings.map((landing) => {
    const parent = servicePlacements.get(`service-${landing.serviceKey}`)
    if (!parent) throw new Error(`Missing parent service media: ${landing.serviceKey}`)

    return {
      ...parent,
      target: `service-area-${landing.key}`,
      role: 'service-area' as const,
      caption: undefined,
    }
  }),
)
