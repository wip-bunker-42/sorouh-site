import type {
  KeywordContentImprovement,
  KeywordContentWaveEntry,
} from '../../content/sorouh/seo/keyword-content-wave'

type ContentImage = Record<string, unknown>
type Faq = { _type?: 'faqItem'; _key?: string; question: string; answer: string }

type ServiceDocument = { id: string; heroImage: ContentImage }
type AreaDocument = { id: string }
type ExistingLandingDocument = { faqs?: Faq[]; seo?: Record<string, unknown> }

export type KeywordContentWavePlannerInput = {
  entries: readonly KeywordContentWaveEntry[]
  improvements: readonly KeywordContentImprovement[]
  serviceDocuments: ReadonlyMap<string, ServiceDocument>
  areaDocuments: ReadonlyMap<string, AreaDocument>
  existingLandingDocuments: ReadonlyMap<string, ExistingLandingDocument>
  existingIds: ReadonlySet<string>
}

export type KeywordContentWavePlan = {
  creates: Record<string, unknown>[]
  patches: Array<{ id: string; set: Record<string, unknown> }>
  unchanged: string[]
}

const reference = (id: string) => ({ _type: 'reference', _ref: id })
const faq = (item: Faq, index: number, prefix: string) => ({
  _type: 'faqItem',
  _key: item._key ?? `${prefix}-${String(index + 1).padStart(2, '0')}`,
  question: item.question,
  answer: item.answer,
})
const block = (text: string, index: number, style: 'h2' | 'normal') => ({
  _type: 'block',
  _key: `intro-${String(index + 1).padStart(2, '0')}`,
  style,
  markDefs: [],
  children: [
    { _type: 'span', _key: `intro-span-${String(index + 1).padStart(2, '0')}`, text, marks: [] },
  ],
})
const seo = (title: string, summary: string, heroImage?: ContentImage) => ({
  _type: 'seo',
  metaTitle: `${title} | صروح الشرقية`,
  metaDescription: `${summary} تواصل للمعاينة وتحديد نطاق التنفيذ.`,
  noIndex: false,
  ...(heroImage ? { shareImage: heroImage } : {}),
})

export function buildKeywordContentWavePlan(
  input: KeywordContentWavePlannerInput,
): KeywordContentWavePlan {
  const creates: Record<string, unknown>[] = []
  const patches: Array<{ id: string; set: Record<string, unknown> }> = []

  for (const entry of input.entries) {
    const id = `service-area-${entry.key}`
    if (input.existingIds.has(id)) {
      throw new Error(`Refusing to recreate existing document: ${id}`)
    }

    const service = input.serviceDocuments.get(entry.serviceKey)
    if (!service)
      throw new Error(`Missing service document for keyword content: ${entry.serviceKey}`)
    const area = input.areaDocuments.get(entry.areaKey)
    if (!area) throw new Error(`Missing area document for keyword content: ${entry.areaKey}`)

    creates.push({
      _id: id,
      _type: 'serviceAreaLanding',
      title: entry.title,
      summary: entry.summary,
      service: reference(service.id),
      serviceArea: reference(area.id),
      heroImage: service.heroImage,
      intro: [block(entry.title, 0, 'h2'), block(entry.localAngle, 1, 'normal')],
      deliverables: entry.deliverables,
      process: entry.process,
      faqs: entry.faqs.map((item, index) => faq(item, index, `faq-${entry.key}`)),
      seo: seo(entry.title, entry.summary, service.heroImage),
      redirectFrom: [],
    })
  }

  for (const improvement of input.improvements) {
    const id = `service-area-${improvement.key}`
    const existing = input.existingLandingDocuments.get(id)
    if (!input.existingIds.has(id) || !existing) {
      throw new Error(`Missing existing landing required for improvement: ${id}`)
    }

    const existingFaqs = existing.faqs ?? []
    patches.push({
      id,
      set: {
        title: improvement.title,
        summary: improvement.summary,
        faqs: [
          ...existingFaqs.map((item, index) => faq(item, index, `faq-existing-${improvement.key}`)),
          ...improvement.additionalFaqs.map((item, index) =>
            faq(item, existingFaqs.length + index, `faq-keyword-${improvement.key}`),
          ),
        ],
        seo: {
          ...existing.seo,
          ...seo(improvement.title, improvement.summary),
        },
      },
    })
  }

  const plannedIds = new Set([
    ...creates.map((item) => item._id as string),
    ...patches.map((item) => item.id),
  ])
  const unchanged = [...input.existingIds]
    .filter((id) => id.startsWith('service-area-') && !plannedIds.has(id))
    .sort()

  return { creates, patches, unchanged }
}
