import { ControlsIcon } from '@sanity/icons/Controls'
import { defineArrayMember, defineField, defineType } from 'sanity'

import {
  contentGroups,
  redirectFromField,
  seoField,
  slugField,
  summaryField,
  titleField,
} from '../shared'

export const service = defineType({
  name: 'service',
  title: 'خدمة',
  type: 'document',
  icon: ControlsIcon,
  groups: contentGroups,
  fields: [
    titleField,
    slugField,
    summaryField,
    defineField({
      name: 'heroImage',
      title: 'الصورة الرئيسية',
      type: 'contentImage',
      group: 'media',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'تفاصيل الخدمة',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'deliverables',
      title: 'ما تتضمنه الخدمة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(4).max(10).unique(),
    }),
    defineField({
      name: 'process',
      title: 'خطوات التنفيذ',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(3).max(8),
    }),
    defineField({
      name: 'faqs',
      title: 'أسئلة شائعة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'faqItem' })],
      validation: (rule) => rule.required().min(3).max(8),
    }),
    seoField,
    redirectFromField,
  ],
  orderings: [
    { title: 'ترتيب العرض', name: 'displayOrder', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'summary', media: 'heroImage' } },
})
