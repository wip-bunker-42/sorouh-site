import { PinIcon } from '@sanity/icons/Pin'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { contentGroups, redirectFromField, seoField, summaryField, titleField } from '../shared'

export const serviceAreaLanding = defineType({
  name: 'serviceAreaLanding',
  title: 'صفحة خدمة محلية',
  type: 'document',
  icon: PinIcon,
  groups: contentGroups,
  fields: [
    titleField,
    summaryField,
    defineField({
      name: 'service',
      title: 'الخدمة',
      type: 'reference',
      to: [{ type: 'service' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'serviceArea',
      title: 'المدينة أو المنطقة',
      type: 'reference',
      to: [{ type: 'serviceArea' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'الصورة الرئيسية',
      type: 'contentImage',
      group: 'media',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'المقدمة المحلية',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'deliverables',
      title: 'نطاق التنفيذ المحلي',
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
      title: 'أسئلة محلية',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'faqItem' })],
      validation: (rule) => rule.required().min(3).max(8),
    }),
    seoField,
    redirectFromField,
  ],
  preview: { select: { title: 'title', subtitle: 'summary', media: 'heroImage' } },
})
