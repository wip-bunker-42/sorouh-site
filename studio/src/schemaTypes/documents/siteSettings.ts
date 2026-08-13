import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { seoField } from '../shared'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'إعدادات الموقع',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'identity', title: 'الهوية والتواصل', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'companyName',
      title: 'اسم الشركة',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'shortName',
      title: 'الاسم المختصر',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'tagline',
      title: 'العبارة التعريفية',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'logo',
      title: 'الشعار',
      type: 'contentImage',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryPhone',
      title: 'رقم التواصل الأساسي',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().regex(/^\+9665\d{8}$/),
    }),
    defineField({
      name: 'backupPhone',
      title: 'رقم التواصل الاحتياطي',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().regex(/^\+9665\d{8}$/),
    }),
    defineField({
      name: 'availability',
      title: 'أوقات التوفر',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'rssAuthorEmail',
      title: 'بريد مؤلف RSS',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'stats',
      title: 'أرقام الثقة',
      type: 'array',
      group: 'identity',
      of: [defineArrayMember({ type: 'stat' })],
      validation: (rule) => rule.required().length(4),
    }),
    defineField({
      name: 'defaultShareImage',
      title: 'صورة المشاركة الافتراضية',
      type: 'contentImage',
      group: 'seo',
      validation: (rule) => rule.required(),
    }),
    seoField,
  ],
  preview: {
    select: { title: 'companyName', subtitle: 'tagline', media: 'logo' },
  },
})
