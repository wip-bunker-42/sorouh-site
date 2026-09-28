import { isDeepStrictEqual } from 'node:util'
import { markdownToPortableText } from '@portabletext/markdown'
import { priorityServiceKeys } from '../../content/sorouh/qualified-service-content'
import { EDITORIAL_ARTICLE_RELATIONS } from '../../content/sorouh/seo/editorial-content-wave'
import {
  keywordContentWave,
  keywordContentWaveImprovements,
} from '../../content/sorouh/seo/keyword-content-wave'
import { serviceAreaLandings } from '../../content/sorouh/service-area-landings'
import { articles, services, siteCopy } from '../../content/sorouh/site-content'

export type CleanupDocument = { _id: string; _type: string; _rev: string; [key: string]: unknown }
export type CleanupPatch = {
  id: string
  ifRevisionID: string
  set: Record<string, unknown>
  unset: string[]
}
export type CleanupWithdrawal = { id: string; ifRevisionID: string; draft: Record<string, unknown> }
export type ServiceContentCleanupPlan = {
  patches: CleanupPatch[]
  withdrawals: CleanupWithdrawal[]
  originals: CleanupDocument[]
  remainingPublishedCounts: Record<string, number>
}
export const unsupportedPublishedIds = [
  'service-roof-insulation',
  'service-water-leak-detection',
  'service-area-roof-insulation-ahsa',
  'service-area-roof-insulation-dammam',
  'post-roof-insulation-guide',
] as const
const unsupportedServiceIds = new Set<string>(unsupportedPublishedIds.slice(0, 2))
const protectedFields = new Set([
  '_id',
  '_type',
  '_rev',
  '_createdAt',
  '_updatedAt',
  'slug',
  'heroImage',
  'featuredImage',
  'image',
])
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function unsupportedHref(value: unknown): boolean {
  if (typeof value !== 'string') return false
  let decoded = value
  try {
    decoded = decodeURIComponent(value)
  } catch {
    /* Keep malformed URLs unchanged. */
  }
  return /\/(?:الخدمات\/(?:عزل-الاسطح|كشف-ومعالجة-تسربات-المياه)(?:\/|$)|المدونة\/دليل-اختيار-عزل-الاسطح(?:\/|$))/.test(
    decoded,
  )
}

function cleanReferences(value: unknown, removedIds: ReadonlySet<string>, weaken = false): unknown {
  if (Array.isArray(value))
    return value
      .map((item) => cleanReferences(item, removedIds, weaken))
      .filter((item) => item !== undefined)
  if (!value || typeof value !== 'object') return value
  const item = record(value)
  if (typeof item._ref === 'string' && removedIds.has(item._ref))
    return weaken ? { ...item, _weak: true } : undefined
  const output = Object.fromEntries(
    Object.entries(item)
      .map(([key, child]) => [key, cleanReferences(child, removedIds, weaken)])
      .filter(([, child]) => child !== undefined),
  )
  if (!weaken && item._type === 'block' && Array.isArray(item.markDefs)) {
    const removedMarks = new Set(
      item.markDefs
        .filter((mark) => unsupportedHref(record(mark).href))
        .map((mark) => record(mark)._key),
    )
    output.markDefs = (output.markDefs as unknown[]).filter(
      (mark) => !removedMarks.has(record(mark)._key),
    )
    output.children = ((output.children as unknown[]) ?? []).map((child) => {
      const span = record(child)
      return {
        ...span,
        ...(Array.isArray(span.marks)
          ? { marks: span.marks.filter((mark) => !removedMarks.has(mark)) }
          : {}),
      }
    })
  }
  return output
}

// Stable keys make review and repeated runs deterministic despite converter-generated keys.
function portable(markdown: string, prefix: string): Record<string, unknown>[] {
  const blocks = markdownToPortableText(markdown) as Record<string, unknown>[]
  const keys = new Map<string, string>()
  let sequence = 0
  const collect = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(collect)
    else if (value && typeof value === 'object') {
      const item = record(value)
      if (typeof item._key === 'string' && !keys.has(item._key))
        keys.set(item._key, `${prefix}-${String(++sequence).padStart(4, '0')}`)
      Object.values(item).forEach(collect)
    }
  }
  collect(blocks)
  const rewrite = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(rewrite)
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(record(value)).map(([key, child]) => [
          key,
          key === '_key' ? keys.get(String(child)) : rewrite(child),
        ]),
      )
    return typeof value === 'string' && keys.has(value) ? keys.get(value) : value
  }
  return rewrite(blocks) as Record<string, unknown>[]
}

const faqs = (
  items: readonly { question: string; answer: string }[],
  key: string,
  existing: unknown,
) =>
  items.map((item, index) => {
    const retained = Array.isArray(existing)
      ? existing.find(
          (candidate) =>
            record(candidate).question === item.question &&
            record(candidate).answer === item.answer,
        )
      : undefined
    return retained ?? { _type: 'faqItem', _key: `${key}-${index + 1}`, ...item }
  })
const seo = (document: CleanupDocument, title: string, description: string) => ({
  ...record(document.seo),
  _type: 'seo',
  metaTitle: title,
  metaDescription: description,
})

function articleBody(markdown: string, document: CleanupDocument): Record<string, unknown>[] {
  const segments = markdown.split('\n[[CTA]]\n')
  if (segments.length !== 2) throw new Error(`Expected one article CTA: ${document._id}`)
  const existingCta = Array.isArray(document.body)
    ? document.body.find((item) => record(item)._type === 'cta')
    : undefined
  const preservedMedia = Array.isArray(document.body)
    ? document.body.filter((item) => !['block', 'cta'].includes(String(record(item)._type)))
    : []
  return [
    ...portable(segments[0]!, 'cleanup-before'),
    record(
      existingCta ?? {
        _type: 'cta',
        _key: 'article-mid',
        headline: 'تحتاج تنفيذًا مرتبًا لمشروعك؟',
        body: 'تواصل لمناقشة حالة الموقع ونطاق العمل المناسب.',
        action: 'whatsapp',
        label: 'تواصل عبر واتساب',
      },
    ),
    ...portable(segments[1]!, 'cleanup-after'),
    ...preservedMedia.map(record),
  ]
}

function qualifiedCopy(document: CleanupDocument): Record<string, unknown> {
  const service = services.find((item) => `service-${item.key}` === document._id)
  const revisedServices = new Set<string>([
    ...priorityServiceKeys,
    'concrete-cutting',
    'annex-construction',
  ])
  if (service && revisedServices.has(service.key))
    return {
      title: service.title,
      summary: service.summary,
      body: portable(
        `## ${service.title}\n\n${service.directAnswer}\n\n### ما نركز عليه\n\n${service.quality.map((item) => `- ${item}`).join('\n')}`,
        'cleanup-service',
      ),
      deliverables: service.deliverables,
      process: service.process,
      faqs: faqs(service.faqs, `faq-${service.key}`, document.faqs),
      ...(document.title !== service.title || document.summary !== service.summary
        ? { seo: seo(document, `${service.title} | صروح الشرقية`, service.summary) }
        : {}),
    }
  const landing = [...serviceAreaLandings, ...keywordContentWave].find(
    (item) => `service-area-${item.key}` === document._id,
  )
  if (landing && (landing.planning || landing.key === 'annex-dammam')) {
    const improvement = keywordContentWaveImprovements.find((item) => item.key === landing.key)
    const title = improvement?.title ?? landing.title
    const summary = improvement?.summary ?? landing.summary
    return {
      title,
      summary,
      intro: portable(
        `## ${title}\n\n${landing.localAngle}\n\n${landing.planning?.map((section) => `## ${section.title}\n\n${section.body}`).join('\n\n') ?? ''}`,
        'cleanup-landing',
      ),
      deliverables: landing.deliverables,
      process: landing.process,
      faqs: faqs(
        [...landing.faqs, ...(improvement?.additionalFaqs ?? [])],
        `faq-${landing.key}`,
        document.faqs,
      ),
      ...(document.title !== title || document.summary !== summary
        ? { seo: seo(document, `${title} | صروح الشرقية`, summary) }
        : {}),
    }
  }
  const article = articles.find((item) => `post-${item.key}` === document._id)
  if (article) {
    const relation =
      EDITORIAL_ARTICLE_RELATIONS[article.key as keyof typeof EDITORIAL_ARTICLE_RELATIONS]
    const links = (keys: string[], prefix: string, existing: unknown) =>
      keys.map((key, index) => {
        const id = `${prefix}-${key}`
        return (
          (Array.isArray(existing)
            ? existing.find((item) => record(item)._ref === id)
            : undefined) ?? { _type: 'reference', _key: `cleanup-ref-${index + 1}`, _ref: id }
        )
      })
    return {
      title: article.title,
      excerpt: article.excerpt,
      body: articleBody(article.markdown, document),
      ...(relation
        ? {
            relatedServices: links(relation.serviceKeys, 'service', document.relatedServices),
            relatedPosts: links(relation.relatedPostKeys, 'post', document.relatedPosts),
          }
        : {}),
      ...(article.key === 'water-leak-before-renovation'
        ? {
            seo: seo(
              document,
              'رطوبة الجدران وإصلاح السباكة قبل الترميم | صروح الشرقية',
              article.excerpt,
            ),
          }
        : {}),
    }
  }
  if (document._id === 'siteSettings')
    return {
      availability: siteCopy.availability,
      stats: siteCopy.stats.map((item, index) => ({
        _type: 'stat',
        _key: `stat-${String(index + 1).padStart(2, '0')}`,
        ...item,
      })),
    }
  if (document._id === 'homePage')
    return {
      seo: seo(
        document,
        String(record(document.seo).metaTitle ?? 'شركة صروح الشرقية للمقاولات | الدمام والخبر'),
        'مقاولات عامة وترميم وتشطيب وقص خرسانة وكهرباء وسباكة في الدمام والخبر ومدن المنطقة الشرقية. تواصل لتنسيق المعاينة.',
      ),
    }
  if (document._id === 'aboutPage' && Array.isArray(document.values))
    return {
      values: document.values.map((item) =>
        record(item).title === 'تواصل مباشر'
          ? { ...record(item), description: 'اتصال وواتساب لتنسيق المعاينة ومناقشة نطاق العمل.' }
          : item,
      ),
    }
  if (document._id === 'contactPage' && Array.isArray(document.faqs))
    return {
      faqs: document.faqs.map((item) =>
        record(item).question === 'متى يمكنني التواصل؟'
          ? {
              ...record(item),
              answer: 'تواصل عبر الاتصال أو واتساب لتنسيق المعاينة ومناقشة تفاصيل العمل.',
            }
          : item,
      ),
    }
  if (document._id === 'project-sorouh-building-plastering-01')
    return {
      result:
        'أسطح متجانسة وخطوط معمارية واضحة أصبحت جاهزة لاستقبال أعمال الدهانات والتشطيبات الخارجية.',
    }
  if (document._id === 'project-sorouh-concrete-saw-01' && Array.isArray(document.scope))
    return {
      scope: document.scope.map((item) =>
        item === 'قص الخرسانة بالمنشار والليزر' ? 'قص الخرسانة بالمنشار الماسي' : item,
      ),
    }
  return {}
}

export function buildServiceContentCleanupPlan(
  documents: readonly CleanupDocument[],
): ServiceContentCleanupPlan {
  const byId = new Map(documents.map((item) => [item._id, item]))
  if (byId.size !== documents.length) throw new Error('Duplicate cleanup document ID')
  const published = documents.filter((item) => !item._id.startsWith('drafts.'))
  const removedIds = new Set<string>(unsupportedPublishedIds)
  for (const document of published)
    if (
      document._type === 'serviceAreaLanding' &&
      unsupportedServiceIds.has(String(record(document.service)._ref))
    )
      removedIds.add(document._id)
  const withdrawnIds = new Set(
    published.filter((document) => removedIds.has(document._id)).map((document) => document._id),
  )
  function hasStrongWithdrawnReference(value: unknown): boolean {
    if (Array.isArray(value)) return value.some(hasStrongWithdrawnReference)
    if (!value || typeof value !== 'object') return false
    const item = record(value)
    if (typeof item._ref === 'string' && withdrawnIds.has(item._ref) && item._weak !== true)
      return true
    return Object.values(item).some(hasStrongWithdrawnReference)
  }
  for (const document of documents) {
    if (document._id.startsWith('drafts.') && hasStrongWithdrawnReference(document))
      throw new Error(`Draft references need review: ${document._id}`)
  }
  const withdrawals: CleanupWithdrawal[] = []
  const patches: CleanupPatch[] = []
  const originals: CleanupDocument[] = []
  const remainingPublishedCounts: Record<string, number> = {}
  for (const document of published) {
    if (!document._rev) throw new Error(`Missing revision: ${document._id}`)
    if (removedIds.has(document._id)) {
      const draftId = `drafts.${document._id}`
      if (byId.has(draftId)) throw new Error(`Existing draft needs review: ${draftId}`)
      const { _rev, _createdAt, _updatedAt, ...content } = document
      withdrawals.push({
        id: document._id,
        ifRevisionID: _rev,
        draft: { ...record(cleanReferences(content, removedIds, true)), _id: draftId },
      })
      originals.push(structuredClone(document))
      continue
    }
    remainingPublishedCounts[document._type] = (remainingPublishedCounts[document._type] ?? 0) + 1
    const desired = { ...record(cleanReferences(document, removedIds)), ...qualifiedCopy(document) }
    const set: Record<string, unknown> = {}
    const unset: string[] = []
    for (const [field, value] of Object.entries(desired))
      if (!protectedFields.has(field) && !isDeepStrictEqual(value, document[field]))
        set[field] = value
    for (const field of Object.keys(document))
      if (!protectedFields.has(field) && !(field in desired)) unset.push(field)
    if (Object.keys(set).length || unset.length) {
      patches.push({ id: document._id, ifRevisionID: document._rev, set, unset })
      originals.push(structuredClone(document))
    }
  }
  return { patches, withdrawals, originals, remainingPublishedCounts }
}
