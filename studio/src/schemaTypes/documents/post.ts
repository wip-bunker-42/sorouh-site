import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { contentGroups, redirectFromField, seoField, slugField, titleField } from '../shared'

export const post = defineType({
  name: 'post',
  title: 'مقال',
  type: 'document',
  icon: DocumentTextIcon,
  groups: contentGroups,
  fields: [
    titleField,
    slugField,
    defineField({
      name: 'excerpt',
      title: 'مقتطف المقال',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required().min(70).max(240),
    }),
    defineField({
      name: 'featuredImage',
      title: 'الصورة البارزة',
      type: 'contentImage',
      group: 'media',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'محتوى المقال',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'category',
      title: 'الفئة الرئيسية',
      type: 'reference',
      group: 'content',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'serviceArea',
      title: 'المدينة المرتبطة',
      description: 'اختياري؛ اربط المقال بمدينة عندما يكون المحتوى محليًا.',
      type: 'reference',
      group: 'content',
      to: [{ type: 'serviceArea' }],
    }),
    defineField({
      name: 'relatedServices',
      title: 'الخدمات المرتبطة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: 'relatedPosts',
      title: 'مقالات مرتبطة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'post' }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: 'publishedAt',
      title: 'تاريخ النشر الأول',
      type: 'datetime',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'الكاتب أو الجهة',
      type: 'string',
      group: 'content',
      initialValue: 'شركة صروح الشرقية للمقاولات',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'articleCta',
      title: 'دعوة التواصل داخل المقال',
      type: 'cta',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    seoField,
    redirectFromField,
  ],
  orderings: [
    { title: 'الأحدث', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'excerpt', media: 'featuredImage' },
  },
})
