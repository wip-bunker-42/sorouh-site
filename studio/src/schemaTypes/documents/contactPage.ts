import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { contentGroups, seoField } from '../shared'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'اتصل بنا',
  type: 'document',
  icon: EnvelopeIcon,
  groups: contentGroups,
  fields: [
    defineField({
      name: 'title',
      title: 'العنوان',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'lead',
      title: 'المقدمة',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required().min(40).max(260),
    }),
    defineField({
      name: 'contactPoints',
      title: 'خيارات التواصل',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'cta' })],
      validation: (rule) => rule.required().min(2).max(4),
    }),
    defineField({
      name: 'serviceAreaIntro',
      title: 'مقدمة مناطق الخدمة',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required().min(40).max(260),
    }),
    defineField({
      name: 'faqs',
      title: 'أسئلة التواصل',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'faqItem' })],
      validation: (rule) => rule.required().min(3).max(8),
    }),
    seoField,
  ],
  preview: { select: { title: 'title', subtitle: 'lead' } },
})
