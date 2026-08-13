import { LinkIcon } from '@sanity/icons/Link'
import { defineField, defineType } from 'sanity'

export const cta = defineType({
  name: 'cta',
  title: 'دعوة للتواصل',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'العنوان',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'body',
      title: 'النص',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required().max(260),
    }),
    defineField({
      name: 'action',
      title: 'الإجراء',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'واتساب', value: 'whatsapp' },
          { title: 'اتصال', value: 'call' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'نص الزر',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
  ],
  preview: { select: { title: 'headline', subtitle: 'label' } },
})
