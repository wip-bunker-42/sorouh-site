import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { contentGroups, seoField } from '../shared'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'من نحن',
  type: 'document',
  icon: InfoOutlineIcon,
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
      validation: (rule) => rule.required().min(50).max(260),
    }),
    defineField({
      name: 'body',
      title: 'نبذة الشركة',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'values',
      title: 'منهجية العمل',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'valueItem',
          title: 'قيمة عمل',
          fields: [
            defineField({
              name: 'title',
              title: 'العنوان',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'الوصف',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(3).max(6),
    }),
    defineField({
      name: 'image',
      title: 'الصورة الرئيسية',
      type: 'contentImage',
      group: 'media',
      validation: (rule) => rule.required(),
    }),
    seoField,
  ],
  preview: { select: { title: 'title', subtitle: 'lead', media: 'image' } },
})
