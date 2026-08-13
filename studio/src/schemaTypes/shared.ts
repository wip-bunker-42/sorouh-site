import { defineArrayMember, defineField } from 'sanity'

export const slugField = defineField({
  name: 'slug',
  title: 'الرابط المختصر',
  type: 'slug',
  options: { source: 'title', maxLength: 96 },
  validation: (rule) =>
    rule.required().custom((slug) => {
      if (!slug?.current) return 'الرابط المختصر مطلوب'
      return /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug.current)
        ? true
        : 'استخدم حروفًا وأرقامًا وشرطات فقط دون مسافات'
    }),
})

export const seoField = defineField({
  name: 'seo',
  title: 'تحسين الظهور في البحث',
  type: 'seo',
  group: 'seo',
})

export const redirectFromField = defineField({
  name: 'redirectFrom',
  title: 'المسارات السابقة',
  description: 'يُدار تلقائيًا عند تغيير الرابط المختصر.',
  type: 'array',
  group: 'technical',
  readOnly: true,
  of: [defineArrayMember({ type: 'string' })],
  validation: (rule) => rule.unique(),
})

export const contentGroups = [
  { name: 'content', title: 'المحتوى', default: true },
  { name: 'media', title: 'الصور والفيديو' },
  { name: 'seo', title: 'SEO' },
  { name: 'technical', title: 'تقني', hidden: true },
]

export const titleField = defineField({
  name: 'title',
  title: 'العنوان',
  type: 'string',
  group: 'content',
  validation: (rule) => rule.required().min(3).max(100),
})

export const summaryField = defineField({
  name: 'summary',
  title: 'الملخص',
  type: 'text',
  rows: 3,
  group: 'content',
  validation: (rule) => rule.required().min(40).max(240),
})
