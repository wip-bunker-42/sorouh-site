import { PinIcon } from '@sanity/icons/Pin'
import { defineArrayMember, defineField, defineType } from 'sanity'

import {
  contentGroups,
  redirectFromField,
  seoField,
  slugField,
  summaryField,
  titleField,
} from '../shared'

export const serviceArea = defineType({
  name: 'serviceArea',
  title: 'منطقة خدمة',
  type: 'document',
  icon: PinIcon,
  groups: contentGroups,
  fields: [
    titleField,
    slugField,
    summaryField,
    defineField({
      name: 'intro',
      title: 'مقدمة المنطقة',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'featuredServices',
      title: 'الخدمات الأبرز في المنطقة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
      validation: (rule) => rule.required().min(4).max(13).unique(),
    }),
    defineField({
      name: 'image',
      title: 'صورة المنطقة',
      type: 'contentImage',
      group: 'media',
      validation: (rule) => rule.required(),
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
  preview: { select: { title: 'title', subtitle: 'summary', media: 'image' } },
})
