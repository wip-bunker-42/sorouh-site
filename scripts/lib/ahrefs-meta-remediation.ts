export type AhrefsMetaDescriptionTarget = {
  documentId: string
  documentType: 'serviceArea' | 'serviceAreaLanding' | 'project' | 'post'
  metaDescription?: string
  metaTitle?: string
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
  {
    documentId: 'service-area-electrical-dammam',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'كهربائي في الدمام لتأسيس نقاط الكهرباء والدوائر وتعديلها في المنازل، مع مراجعة مواقع الاستخدام واختبارها قبل إغلاق الجدران والأسقف.',
  },
  {
    documentId: 'service-area-painter-khobar',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'دهانات منازل وفلل في الخبر بعد تجهيز الأسطح ومعالجة العيوب واختيار طبقات البطانة والطلاء بحسب نوع الجدار واستخدام المساحة.',
  },
  {
    documentId: 'service-area-gypsum-dammam',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'تركيب جبس بورد في الدمام للأسقف والقواطع والفتحات الديكورية، مع ضبط المناسيب وتنسيق الإنارة والتكييف والخدمات المخفية.',
  },
  {
    documentId: 'service-area-demolition-dammam',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'أعمال هدم وإزالة في الدمام ضمن نطاق واضح، تشمل حماية الأجزاء الباقية وترتيب مسار المخلفات وتجهيز الموقع قبل التنفيذ.',
  },
  {
    documentId: 'service-area-painter-qatif',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'دهانات وتجديد جدران في القطيف بعد فحص الطلاء وتنظيف الأسطح ومعالجة المناطق المتضررة، ثم تنفيذ ألوان وتشطيبات متناسقة.',
  },
  {
    documentId: 'service-area-painter-jubail',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'أعمال دهانات في الجبيل للمساحات السكنية، من فحص السطح وتحضير الحواف والزوايا إلى تطبيق الطبقات ومراجعة التجانس النهائي.',
  },
  {
    documentId: 'service-area-plumbing-khobar',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'سباك في الخبر لتنظيم أعمال التغذية والصرف في المنازل والشقق، مع فحص المواقع المتأثرة واختبار الخطوط ضمن نطاق العمل.',
  },
  {
    documentId: 'service-area-building-contractor-dammam',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'مقاول بناء في الدمام لأعمال المباني والتنفيذ المدني للمنازل والفلل، مع مراجعة المحاور والمناسيب والفتحات قبل انتقال المراحل.',
  },
  {
    documentId: 'service-area-painter-ahsa',
    documentType: 'serviceAreaLanding',
    metaDescription:
      'دهانات في الأحساء للمنازل والفلل تشمل تحضير الجدران والأسقف ومعالجة العيوب وتنفيذ الطلاء الداخلي أو الخارجي وفق حالة السطح.',
  },
  {
    documentId: 'post-water-leak-before-renovation',
    documentType: 'post',
    metaTitle: 'علامات تسرب المياه قبل الترميم | صروح الشرقية',
  },
  {
    documentId: 'post-wall-preparation-before-painting',
    documentType: 'post',
    metaTitle: 'تجهيز الجدران قبل الدهان | صروح الشرقية',
  },
  {
    documentId: 'post-roof-insulation-guide',
    documentType: 'post',
    metaTitle: 'دليل اختيار عزل الأسطح | صروح الشرقية',
  },
]

type ReviewedDocument = {
  _id: string
  _type: string
}

export type AhrefsMetaRemediationPatch = {
  documentId: string
  set: Partial<Record<'seo.metaDescription' | 'seo.metaTitle', string>>
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
    const set = {
      ...(target.metaDescription ? { 'seo.metaDescription': target.metaDescription } : {}),
      ...(target.metaTitle ? { 'seo.metaTitle': target.metaTitle } : {}),
    }
    if (Object.keys(set).length === 0) throw new Error(`Missing metadata for ${target.documentId}`)
    return { documentId: target.documentId, set }
  })
}
