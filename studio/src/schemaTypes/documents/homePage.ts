import { HomeIcon } from '@sanity/icons/Home'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { contentGroups, seoField } from '../shared'

export const homePage = defineType({
  name: 'homePage',
  title: 'الصفحة الرئيسية',
  type: 'document',
  icon: HomeIcon,
  groups: contentGroups,
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'العبارة فوق العنوان',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'heroTitle',
      title: 'العنوان الرئيسي',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().min(20).max(120),
    }),
    defineField({
      name: 'heroSummary',
      title: 'ملخص المقدمة',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required().min(50).max(260),
    }),
    defineField({
      name: 'heroImage',
      title: 'صورة المقدمة',
      type: 'contentImage',
      group: 'media',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'introduction',
      title: 'مقدمة الشركة',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'featuredServices',
      title: 'الخدمات المميزة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
      validation: (rule) => rule.required().min(4).max(8).unique(),
    }),
    defineField({
      name: 'featuredProjects',
      title: 'المشاريع المميزة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })],
      validation: (rule) => rule.required().min(3).max(8).unique(),
    }),
    defineField({
      name: 'closingCta',
      title: 'دعوة التواصل الختامية',
      type: 'cta',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    seoField,
  ],
  preview: { prepare: () => ({ title: 'الصفحة الرئيسية' }) },
})
