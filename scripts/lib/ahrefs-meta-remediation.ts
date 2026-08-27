export type AhrefsMetaDescriptionTarget = {
  documentId: string
  documentType: 'serviceArea' | 'project' | 'post'
  metaDescription: string
}

export const AHREFS_META_DESCRIPTION_TARGETS: readonly AhrefsMetaDescriptionTarget[] = [
  {
    documentId: 'area-khobar',
    documentType: 'serviceArea',
    metaDescription:
      'شركة صروح الشرقية للمقاولات تقدم في الخبر خدمات البناء والترميم والتشطيب للمنازل والفلل، مع معاينة وتنسيق واضح لمراحل التنفيذ.',
  },
  {
    documentId: 'area-buqayq',
    documentType: 'serviceArea',
    metaDescription:
      'شركة صروح الشرقية للمقاولات تقدم في بقيق أعمال البناء والترميم والتشطيب والخدمات الفنية للمنازل والفلل، من المعاينة حتى تسليم نطاق العمل.',
  },
  {
    documentId: 'area-saihat',
    documentType: 'serviceArea',
    metaDescription:
      'شركة صروح الشرقية للمقاولات تخدم سيهات في أعمال البناء والترميم وتشطيبات المنازل والفلل، مع ترتيب البنود ومراجعة التنفيذ خطوة بخطوة.',
  },
  {
    documentId: 'project-sorouh-porcelain-khobar-01',
    documentType: 'project',
    metaDescription:
      'شاهد تفاصيل تشطيب حمام ببورسلان رخامي ونيش دش في الخبر، من تخطيط الألواح وضبط العروق إلى الفواصل والزوايا حول التجهيزات الصحية.',
  },
  {
    documentId: 'project-sorouh-luxury-porcelain-dammam-01',
    documentType: 'project',
    metaDescription:
      'شاهد مشروع تشطيب حمام فاخر ببورسلان رخامي ذهبي في الدمام، مع تنسيق المغسلة والإضاءة المخفية وضبط الفواصل والتفاصيل الصحية النهائية.',
  },
  {
    documentId: 'post-concrete-cutting-guide',
    documentType: 'post',
    metaDescription:
      'دليل يوضح الفرق بين قص الخرسانة بالمنشار الماسي وفتحات الكور، ومتى يستخدم كل حل وكيفية تجهيز موقع العمل قبل التنفيذ.',
  },
  {
    documentId: 'post-porcelain-installation',
    documentType: 'post',
    metaDescription:
      'دليل عملي لتركيب السيراميك والبورسلان يشرح تخطيط التوزيع والقصات والميول والفواصل التي ترفع جودة التشطيب في المنازل والفلل.',
  },
]

type ReviewedDocument = {
  _id: string
  _type: string
}

export type AhrefsMetaRemediationPatch = {
  documentId: string
  set: { 'seo.metaDescription': string }
}

export function buildAhrefsMetaRemediationPatches(
  documents: ReviewedDocument[],
): AhrefsMetaRemediationPatch[] {
  const expectedIds = new Set(AHREFS_META_DESCRIPTION_TARGETS.map((target) => target.documentId))
  const unexpected = documents.filter((document) => !expectedIds.has(document._id))
  if (unexpected.length > 0) throw new Error('Refusing unexpected documents in Ahrefs remediation')

  const byId = new Map(documents.map((document) => [document._id, document]))
  return AHREFS_META_DESCRIPTION_TARGETS.map((target) => {
    const document = byId.get(target.documentId)
    if (!document) throw new Error(`Missing reviewed document: ${target.documentId}`)
    if (document._type !== target.documentType) {
      throw new Error(`Unexpected document type for ${target.documentId}: ${document._type}`)
    }
    return { documentId: target.documentId, set: { 'seo.metaDescription': target.metaDescription } }
  })
}
