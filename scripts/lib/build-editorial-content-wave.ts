import { markdownToPortableText } from '@portabletext/markdown'

type EditorialArticle = {
  key: string
  title: string
  slug: string
  excerpt: string
  categoryKey: string
  areaKey: string
  publishedAt: string
  markdown: string
}

type ContentImage = Record<string, unknown>

export type EditorialContentWaveInput = {
  articles: readonly EditorialArticle[]
  relations: ReadonlyMap<string, { serviceKeys: string[]; relatedPostKeys: string[] }>
  categoryIds: ReadonlyMap<string, string>
  areaIds: ReadonlyMap<string, string>
  serviceIds: ReadonlyMap<string, string>
  postIds: ReadonlyMap<string, string>
  images: ReadonlyMap<string, ContentImage>
  existingIds: ReadonlySet<string>
  author: string
}

export type EditorialContentWavePlan = { creates: Record<string, unknown>[] }

const keyedReference = (id: string, index: number) => ({
  _type: 'reference',
  _key: `ref-${String(index + 1).padStart(2, '0')}`,
  _ref: id,
})
const reference = (id: string) => ({ _type: 'reference', _ref: id })
const cta = (headline: string, body: string, action: 'call' | 'whatsapp', label: string) => ({
  _type: 'cta',
  _key: 'article-mid',
  headline,
  body,
  action,
  label,
})

function portable(markdown: string): Record<string, unknown>[] {
  return markdownToPortableText(markdown).map((block, index) => ({
    ...block,
    _key: block._key ?? `block-${String(index + 1).padStart(2, '0')}`,
  })) as Record<string, unknown>[]
}

function articlePortable(markdown: string, title: string): Record<string, unknown>[] {
  const segments = markdown.split('\n[[CTA]]\n')
  if (segments.length !== 2) throw new Error(`Article ${title} must contain exactly one CTA marker`)
  return [
    ...portable(segments[0]!),
    cta(
      'تحتاج تنفيذًا مرتبًا لمشروعك؟',
      'تواصل معنا لمناقشة حالة الموقع والخطوة المناسبة قبل بدء التنفيذ.',
      'whatsapp',
      'تواصل عبر واتساب',
    ),
    ...portable(segments[1]!).map((block, index) => ({
      ...block,
      _key: `after-${String(index + 1).padStart(2, '0')}`,
    })),
  ]
}

export function buildEditorialContentWave(
  input: EditorialContentWaveInput,
): EditorialContentWavePlan {
  const creates: Record<string, unknown>[] = []
  const seen = new Set<string>()

  for (const article of input.articles) {
    if (seen.has(article.key)) throw new Error(`Duplicate editorial article key: ${article.key}`)
    seen.add(article.key)

    const id = `post-${article.key}`
    if (input.existingIds.has(id)) throw new Error(`Refusing to recreate existing post: ${id}`)

    const relation = input.relations.get(article.key)
    if (!relation) throw new Error(`Missing editorial relation: ${article.key}`)
    const categoryId = input.categoryIds.get(article.categoryKey)
    if (!categoryId) throw new Error(`Missing category: ${article.categoryKey}`)
    const areaId = input.areaIds.get(article.areaKey)
    if (!areaId) throw new Error(`Missing area: ${article.areaKey}`)
    const image = input.images.get(article.key)
    if (!image) throw new Error(`Missing editorial image: ${article.key}`)

    const serviceIds = relation.serviceKeys.map((key) => {
      const serviceId = input.serviceIds.get(key)
      if (!serviceId) throw new Error(`Missing related service: ${key}`)
      return serviceId
    })
    const relatedPostIds = relation.relatedPostKeys.map((key) => {
      const postId = input.postIds.get(key)
      if (!postId) throw new Error(`Missing related post: ${key}`)
      return postId
    })

    creates.push({
      _id: id,
      _type: 'post',
      title: article.title,
      slug: { _type: 'slug', current: article.slug },
      excerpt: article.excerpt,
      featuredImage: image,
      body: articlePortable(article.markdown, article.title),
      category: reference(categoryId),
      serviceArea: reference(areaId),
      relatedServices: serviceIds.map(keyedReference),
      relatedPosts: relatedPostIds.map(keyedReference),
      publishedAt: article.publishedAt,
      author: input.author,
      articleCta: cta(
        'تحتاج مقاولًا لمشروعك في المنطقة الشرقية؟',
        'أرسل تفاصيل العمل والمدينة عبر واتساب أو اتصل لمناقشة نطاق التنفيذ.',
        'whatsapp',
        'تواصل عبر واتساب',
      ),
      seo: {
        _type: 'seo',
        metaTitle: `${article.title} | صروح الشرقية`,
        metaDescription: article.excerpt,
        noIndex: false,
        shareImage: image,
      },
      redirectFrom: [],
    })
  }

  return { creates }
}
