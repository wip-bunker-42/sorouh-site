import { TagIcon } from '@sanity/icons/Tag'
import { defineField, defineType } from 'sanity'

import { redirectFromField, seoField, slugField, titleField } from '../shared'

export const category = defineType({
  name: 'category',
  title: 'فئة مقال',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'content', title: 'المحتوى', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'technical', title: 'تقني', hidden: true },
  ],
  fields: [
    titleField,
    slugField,
    defineField({
      name: 'description',
      title: 'وصف الفئة',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required().min(40).max(240),
    }),
    seoField,
    redirectFromField,
  ],
  preview: { select: { title: 'title', subtitle: 'description' } },
})
