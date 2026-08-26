import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { markdownToPortableText } from '@portabletext/markdown'
import { getCliClient } from 'sanity/cli'

import { sourceAssets } from '../content/sorouh/asset-manifest'
import { projectDrafts } from '../content/sorouh/project-evidence'
import { sorouhSemanticMediaPlan } from '../content/sorouh/semantic-media-plan'
import { serviceAreaLandings } from '../content/sorouh/service-area-landings'
import { areas, articles, categories, services, siteCopy } from '../content/sorouh/site-content'
import { buildManagedContentImage } from './lib/build-semantic-media-patches'

const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const dryRun = process.argv.includes('--dry-run')
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const client = getCliClient({ apiVersion: '2026-08-13' }).withConfig({ dataset: DATASET })

const config = client.config()
if (config.projectId !== EXPECTED_PROJECT_ID || config.dataset !== DATASET) {
  throw new Error(
    `Refusing seed: expected ${EXPECTED_PROJECT_ID}/${DATASET}, received ${config.projectId}/${config.dataset}`,
  )
}

const key = (prefix: string, index: number) => `${prefix}-${String(index + 1).padStart(2, '0')}`
const ref = (_ref: string, index = 0) => ({ _type: 'reference', _key: key('ref', index), _ref })
const slug = (current: string) => ({ _type: 'slug', current })
const seo = (metaTitle: string, metaDescription: string, shareImage?: Record<string, unknown>) => ({
  _type: 'seo',
  metaTitle,
  metaDescription,
  noIndex: false,
  ...(shareImage ? { shareImage } : {}),
})
const cta = (
  headline: string,
  body: string,
  action: 'call' | 'whatsapp',
  label: string,
  itemKey = 'cta',
) => ({
  _type: 'cta',
  _key: itemKey,
  headline,
  body,
  action,
  label,
})
const faq = (question: string, answer: string, index: number) => ({
  _type: 'faqItem',
  _key: key('faq', index),
  question,
  answer,
})

function portable(markdown: string): Record<string, unknown>[] {
  return markdownToPortableText(markdown).map((block, index) => ({
    ...block,
    _key: block._key ?? key('block', index),
  })) as Record<string, unknown>[]
}

function articlePortable(markdown: string, headline: string): Record<string, unknown>[] {
  const segments = markdown.split('\n[[CTA]]\n')
  if (segments.length !== 2)
    throw new Error(`Article ${headline} must contain exactly one CTA marker`)
  return [
    ...portable(segments[0]!),
    cta(
      headline,
      'اتصل بنا أو أرسل تفاصيل احتياجك عبر واتساب لنرتب المعاينة والخطوة التالية.',
      'whatsapp',
      'تواصل عبر واتساب',
      'article-mid',
    ),
    ...portable(segments[1]!).map((block, index) => ({ ...block, _key: key('after', index) })),
  ]
}

const imageSources = new Map(
  sourceAssets
    .filter((asset) => asset.mimeType.startsWith('image/'))
    .map((asset) => [asset.key, asset]),
)
const semanticAssets = new Map(sorouhSemanticMediaPlan.assets.map((asset) => [asset.key, asset]))
const semanticPlacements = new Map(
  sorouhSemanticMediaPlan.placements.map((placement) => [placement.target, placement]),
)
const uploaded = new Map<string, string>()
const existingIds = new Set(await client.fetch<string[]>(`*[_id in path("**")]._id`))

async function uploadImage(mediaKey: string): Promise<string> {
  const remembered = uploaded.get(mediaKey)
  if (remembered) return remembered
  const semantic = semanticAssets.get(mediaKey)
  const source = imageSources.get(mediaKey)
  if (!semantic && !source) throw new Error(`No image source for ${mediaKey}`)
  const sourcePath = semantic
    ? resolve(root, semantic.path)
    : resolve(root, 'work/source-media/sorouh', source!.sourcePath)
  const buffer = await readFile(sourcePath)
  const asset = await client.assets.upload('image', buffer, {
    filename: basename(sourcePath),
    label: `sorouh:${mediaKey}`,
  })
  uploaded.set(mediaKey, asset._id)
  return asset._id
}

const imageFallback: Record<string, string> = {
  'building-plastering-video': 'building-plastering-video-still',
  'porcelain-video': 'porcelain-dammam-gold-bath',
  'concrete-saw-video': 'concrete-saw-eastern',
  'electrical-plumbing-video': 'electrical-plumbing-dammam',
}

async function contentImage(mediaKey: string, alt: string, caption?: string) {
  const resolvedKey = imageFallback[mediaKey] ?? mediaKey
  return {
    _type: 'contentImage',
    asset: { _type: 'reference', _ref: await uploadImage(resolvedKey) },
    alt,
    ...(caption ? { caption } : {}),
  }
}

async function plannedContentImage(target: string) {
  const placement = semanticPlacements.get(target)
  if (!placement) throw new Error(`No semantic media placement for ${target}`)
  return buildManagedContentImage(placement, await uploadImage(placement.assetKey))
}

const missingIds = (ids: string[]) => ids.filter((id) => !existingIds.has(id))
const plannedIds = [
  'siteSettings',
  'homePage',
  'aboutPage',
  'contactPage',
  ...services.map((item) => `service-${item.key}`),
  ...areas.map((item) => `area-${item.key}`),
  ...serviceAreaLandings.map((item) => `service-area-${item.key}`),
  ...categories.map((item) => `category-${item.key}`),
  ...projectDrafts.map((item) => `project-${item.sourceKey}`),
  ...articles.map((item) => `post-${item.key}`),
]

if (dryRun) {
  const missing = missingIds(plannedIds)
  console.log(
    JSON.stringify(
      {
        projectId: config.projectId,
        dataset: config.dataset,
        mode: 'dry-run',
        planned: plannedIds.length,
        existing: plannedIds.length - missing.length,
        missing: missing.length,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const docs: Record<string, unknown>[] = []

for (const service of services) {
  const id = `service-${service.key}`
  if (existingIds.has(id)) continue
  const hero = await plannedContentImage(id)
  docs.push({
    _id: id,
    _type: 'service',
    title: service.title,
    slug: slug(service.slug),
    summary: service.summary,
    heroImage: hero,
    body: portable(
      `## ${service.title}\n\n${service.directAnswer}\n\n### ما نركز عليه\n\n${service.quality.map((item) => `- ${item}`).join('\n')}`,
    ),
    deliverables: service.deliverables,
    process: service.process,
    faqs: service.faqs.map((item, index) => faq(item.question, item.answer, index)),
    seo: seo(
      `${service.title} في المنطقة الشرقية | صروح الشرقية`,
      `${service.summary} تواصل للمعاينة وتحديد نطاق التنفيذ.`,
      hero,
    ),
    redirectFrom: [],
  })
}

for (const area of areas) {
  const id = `area-${area.key}`
  if (existingIds.has(id)) continue
  const image = await plannedContentImage(id)
  docs.push({
    _id: id,
    _type: 'serviceArea',
    title: area.title,
    slug: slug(area.slug),
    summary: `مقاولات وترميم وتشطيب وخدمات فنية للمنازل والفلل في ${area.title}.`,
    intro: portable(
      `## مقاولات في ${area.title}\n\n${area.angle}\n\nنحدد نطاق العمل بعد المعاينة، ونرتب البنود من التجهيز حتى المراجعة النهائية حتى يعرف العميل الخطوة التالية بوضوح.`,
    ),
    featuredServices: services
      .slice(0, 8)
      .map((service, index) => ref(`service-${service.key}`, index)),
    image,
    faqs: [
      faq(
        `هل تقدمون خدمات المقاولات في ${area.title}؟`,
        `نعم، نخدم ${area.title} في أعمال البناء والترميم والتشطيب والخدمات الفنية بحسب نطاق المشروع.`,
        0,
      ),
      faq(
        'كيف أطلب معاينة؟',
        'اتصل على الرقم الأساسي أو أرسل تفاصيل الموقع ونوع العمل عبر واتساب، وسننسق الخطوة المناسبة.',
        1,
      ),
      faq(
        'هل تنفذون أعمالًا منفصلة أم تشطيبًا كاملًا؟',
        'ننظم الخدمة حسب الاحتياج؛ يمكن تنفيذ بند متخصص أو مجموعة أعمال مترابطة ضمن مشروع واحد.',
        2,
      ),
    ],
    seo: seo(
      `مقاول في ${area.title} | صروح الشرقية`,
      `شركة صروح الشرقية للمقاولات تقدم خدمات البناء والترميم والتشطيب في ${area.title}. اتصل أو تواصل عبر واتساب.`,
      image,
    ),
    redirectFrom: [],
  })
}

for (const landing of serviceAreaLandings) {
  const id = `service-area-${landing.key}`
  if (existingIds.has(id)) continue
  const heroImage = await plannedContentImage(`service-${landing.serviceKey}`)
  docs.push({
    _id: id,
    _type: 'serviceAreaLanding',
    title: landing.title,
    summary: landing.summary,
    service: ref(`service-${landing.serviceKey}`),
    serviceArea: ref(`area-${landing.areaKey}`),
    heroImage,
    intro: portable(`## ${landing.title}\n\n${landing.localAngle}`),
    deliverables: landing.deliverables,
    process: landing.process,
    faqs: landing.faqs.map((item, index) => faq(item.question, item.answer, index)),
    seo: seo(
      `${landing.title} | صروح الشرقية`,
      `${landing.summary} تواصل للمعاينة وتحديد نطاق التنفيذ.`,
      heroImage,
    ),
    redirectFrom: [],
  })
}

for (const category of categories) {
  const id = `category-${category.key}`
  if (existingIds.has(id)) continue
  docs.push({
    _id: id,
    _type: 'category',
    title: category.title,
    slug: slug(category.slug),
    description: category.description,
    seo: seo(
      `${category.title} | مدونة صروح الشرقية`,
      `${category.description} اقرأ أدلة صروح الشرقية العملية للمنازل والفلل في المنطقة الشرقية.`,
    ),
    redirectFrom: [],
  })
}

for (const [projectIndex, project] of projectDrafts.entries()) {
  const id = `project-${project.sourceKey}`
  if (existingIds.has(id)) continue
  const gallery = []
  if (semanticPlacements.has(id)) {
    gallery.push({ ...(await plannedContentImage(id)), _key: 'semantic-media-primary' })
  } else {
    for (const [index, mediaKey] of project.mediaKeys.entries()) {
      if (!imageSources.has(mediaKey)) continue
      gallery.push({
        ...(await contentImage(
          mediaKey,
          `${project.title} — صورة من مرحلة التنفيذ ${index + 1}`,
          project.result,
        )),
        _key: key('gallery', index),
      })
    }
  }
  const videos = project.youtubeUrl
    ? [
        {
          _type: 'youtubeVideo',
          _key: 'project-video',
          url: project.youtubeUrl,
          title: `فيديو ${project.title}`,
          description: `${project.summary} شاهد جانبًا من التنفيذ في موقع المشروع.`,
          uploadDate: project.youtubeUploadDate,
        },
      ]
    : []
  docs.push({
    _id: id,
    _type: 'project',
    sourceKey: project.sourceKey,
    title: project.title,
    slug: slug(project.slug),
    summary: project.summary,
    classification: project.classification,
    workDescription: portable(`## وصف الأعمال\n\n${project.description}`),
    scope: project.serviceKeys
      .map((serviceKey) => services.find((service) => service.key === serviceKey)?.title)
      .filter(Boolean),
    stages: project.stages,
    result: project.result,
    services: project.serviceKeys.map((serviceKey, index) => ref(`service-${serviceKey}`, index)),
    serviceArea: ref(`area-${project.areaKey}`),
    gallery,
    videos,
    featured: projectIndex < 6,
    relatedProjects: [],
    seo: seo(project.seo.metaTitle, project.seo.metaDescription, gallery[0]),
    redirectFrom: [],
  })
}

const articleServices: Record<string, string[]> = {
  'choose-contractor': ['general-contracting', 'building-contractor'],
  'villa-restoration-plan': ['home-villa-renovation', 'home-villa-finishing'],
  'concrete-cutting-guide': ['concrete-cutting', 'core-drilling'],
  'mep-before-finishing': ['electrical', 'plumbing'],
  'porcelain-installation': ['tile-porcelain', 'home-villa-finishing'],
}

for (const article of articles) {
  const id = `post-${article.key}`
  if (existingIds.has(id)) continue
  const featuredImage = await plannedContentImage(id)
  docs.push({
    _id: id,
    _type: 'post',
    title: article.title,
    slug: slug(article.slug),
    excerpt: article.excerpt,
    featuredImage,
    body: articlePortable(
      article.markdown,
      article.areaKey === 'dammam' ? 'تحتاج مقاولًا في الدمام؟' : 'تحتاج تنفيذًا مرتبًا لمشروعك؟',
    ),
    category: ref(`category-${article.categoryKey}`),
    serviceArea: ref(`area-${article.areaKey}`),
    relatedServices: articleServices[article.key]!.map((serviceKey, index) =>
      ref(`service-${serviceKey}`, index),
    ),
    relatedPosts: articles
      .filter((candidate) => candidate.key !== article.key)
      .slice(0, 3)
      .map((candidate, index) => ref(`post-${candidate.key}`, index)),
    publishedAt: article.publishedAt,
    author: siteCopy.companyName,
    articleCta: cta(
      'تحتاج مقاولًا لمشروعك في المنطقة الشرقية؟',
      'تواصل مع صروح الشرقية عبر واتساب أو الاتصال لمناقشة نطاق العمل وترتيب المعاينة.',
      'whatsapp',
      'تواصل عبر واتساب',
    ),
    seo: seo(`${article.title} | صروح الشرقية`, article.excerpt, featuredImage),
    redirectFrom: [],
  })
}

const logo = await contentImage('brand-logo-source', 'شعار شركة صروح الشرقية للمقاولات')
const ogBuffer = await readFile(resolve(root, 'web/public/brand/og-default.jpg'))
const ogAsset = await client.assets.upload('image', ogBuffer, {
  filename: 'sorouh-og-default.jpg',
  label: 'sorouh:og-default',
})
const defaultShareImage = {
  _type: 'contentImage',
  asset: { _type: 'reference', _ref: ogAsset._id },
  alt: 'شركة صروح الشرقية للمقاولات — مقاولات وترميم وتشطيب',
}

if (!existingIds.has('siteSettings'))
  docs.push({
    _id: 'siteSettings',
    _type: 'siteSettings',
    ...siteCopy,
    logo,
    stats: siteCopy.stats.map((item, index) => ({
      _type: 'stat',
      _key: key('stat', index),
      ...item,
    })),
    defaultShareImage,
    seo: seo(
      'شركة صروح الشرقية للمقاولات | الدمام والخبر',
      'مقاولات عامة وترميم وتشطيب وقص خرسانة وكهرباء وسباكة في الدمام والخبر ومدن المنطقة الشرقية.',
      defaultShareImage,
    ),
  })

if (!existingIds.has('aboutPage')) {
  const aboutImage = await plannedContentImage('aboutPage')
  docs.push({
    _id: 'aboutPage',
    _type: 'aboutPage',
    title: 'من نحن — صروح الشرقية للمقاولات',
    lead: 'شركة مقاولات تخدم المنازل والفلل في المنطقة الشرقية عبر تنفيذ منظم يجمع الأعمال المدنية والخدمات والتشطيبات تحت متابعة واحدة.',
    body: portable(
      '## خبرة تنفيذية في موقع المشروع\n\nنؤمن أن جودة المشروع تبدأ من وضوح النطاق وترتيب المراحل. نعاين الموقع، ننسق البنود المتداخلة، ونراجع كل مرحلة قبل الانتقال لما بعدها.\n\n## من المعاينة حتى التسليم\n\nنعمل في البناء والترميم والتشطيب والخرسانة والكهرباء والسباكة والديكور، ما يساعد على تقليل التعارض وتحويل التفاصيل الفنية إلى خطوات مفهومة للعميل.',
    ),
    values: [
      {
        _key: 'value-1',
        title: 'وضوح النطاق',
        description: 'نعرف ما سيتم تنفيذه وحدود كل بند قبل بدء العمل.',
      },
      {
        _key: 'value-2',
        title: 'تنسيق المراحل',
        description: 'نرتب الفرق والأعمال وفق اعتماد كل مرحلة على الأخرى.',
      },
      {
        _key: 'value-3',
        title: 'مراجعة مستمرة',
        description: 'نفحص التفاصيل أثناء التنفيذ وليس عند التسليم فقط.',
      },
      {
        _key: 'value-4',
        title: 'تواصل مباشر',
        description: 'اتصال وواتساب على مدار الساعة لتسهيل بدء الطلب ومتابعته.',
      },
    ],
    image: aboutImage,
    seo: seo(
      'من نحن | شركة صروح الشرقية للمقاولات',
      'تعرف على منهج صروح الشرقية في تنفيذ وإدارة مشاريع البناء والترميم والتشطيب للمنازل والفلل بالمنطقة الشرقية.',
      aboutImage,
    ),
  })
}

if (!existingIds.has('contactPage'))
  docs.push({
    _id: 'contactPage',
    _type: 'contactPage',
    title: 'اتصل بشركة صروح الشرقية للمقاولات',
    lead: 'أرسل نوع العمل ومدينة المشروع عبر واتساب أو اتصل بنا مباشرة. الرقم الأساسي للطلبات والرقم الثاني متاح كخيار احتياطي.',
    contactPoints: [
      cta(
        'تواصل على الرقم الأساسي',
        'اتصال وواتساب لاستقبال تفاصيل مشروعك وترتيب المعاينة.',
        'whatsapp',
        'واتساب الرقم الأساسي',
        'primary',
      ),
      cta(
        'رقم التواصل الاحتياطي',
        'خيار إضافي للاتصال أو واتساب عند الحاجة.',
        'call',
        'اتصل بالرقم الاحتياطي',
        'backup',
      ),
    ],
    serviceAreaIntro:
      'نخدم الدمام والخبر والظهران والقطيف والجبيل وسيهات والأحساء ورأس تنورة وبقيق ومختلف مدن المنطقة الشرقية.',
    faqs: [
      faq(
        'متى يمكنني التواصل؟',
        'نستقبل الاتصال ورسائل واتساب على مدار الساعة طوال أيام الأسبوع.',
        0,
      ),
      faq(
        'ما المعلومات المفيدة قبل المعاينة؟',
        'اذكر المدينة ونوع العقار والعمل المطلوب، وأرسل صورًا واضحة للموقع عبر واتساب إن توفرت.',
        1,
      ),
      faq(
        'هل يمكن طلب خدمة واحدة فقط؟',
        'نعم، يمكن مناقشة بند مستقل أو مجموعة أعمال مترابطة بحسب احتياج المشروع.',
        2,
      ),
    ],
    seo: seo(
      'اتصل بنا | صروح الشرقية للمقاولات',
      'اتصل أو تواصل عبر واتساب مع شركة صروح الشرقية للمقاولات لخدمات البناء والترميم والتشطيب في المنطقة الشرقية.',
    ),
  })

if (!existingIds.has('homePage')) {
  const homeHero = await plannedContentImage('homePage')
  docs.push({
    _id: 'homePage',
    _type: 'homePage',
    heroEyebrow: 'مقاولات • ترميم • تشطيب',
    heroTitle: 'نبني ونرمم ونشطب مشروعك في المنطقة الشرقية بإدارة واحدة',
    heroSummary:
      'شركة صروح الشرقية للمقاولات تنفذ أعمال المنازل والفلل في الدمام والخبر ومدن الشرقية، من المعاينة وتحديد النطاق إلى التنفيذ والمراجعة والتسليم.',
    heroImage: homeHero,
    introduction: portable(
      '## تنفيذ مرتب من الأساس إلى آخر تفصيلة\n\nنجمع خبرات البناء والترميم والخرسانة والكهرباء والسباكة والتشطيبات لتقليل التعارض بين البنود. يبدأ كل طلب بفهم الموقع والاحتياج ثم ترتيب المراحل ونقاط المراجعة.',
    ),
    featuredServices: services
      .slice(0, 8)
      .map((service, index) => ref(`service-${service.key}`, index)),
    featuredProjects: projectDrafts
      .slice(0, 6)
      .map((project, index) => ref(`project-${project.sourceKey}`, index)),
    closingCta: cta(
      'جاهز تبدأ مشروعك؟',
      'أرسل تفاصيل العمل والمدينة عبر واتساب أو اتصل بنا لترتيب الخطوة الأولى.',
      'whatsapp',
      'ابدأ عبر واتساب',
    ),
    seo: seo(
      'شركة صروح الشرقية للمقاولات | مقاول بالمنطقة الشرقية',
      'مقاولات عامة وترميم وتشطيب وقص خرسانة وكهرباء وسباكة في الدمام والخبر ومدن المنطقة الشرقية. تواصل على مدار الساعة.',
      homeHero,
    ),
  })
}

const transaction = client.transaction()
for (const document of docs) transaction.create(document as any)
if (docs.length > 0) await transaction.commit({ visibility: 'async' })

console.log(
  JSON.stringify(
    {
      projectId: config.projectId,
      dataset: config.dataset,
      mode: 'create-missing',
      createdDocuments: docs.length,
      uploadedAssets: uploaded.size + 1,
      preservedDocuments: plannedIds.length - docs.length,
    },
    null,
    2,
  ),
)
