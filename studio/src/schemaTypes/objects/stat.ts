import { ChartUpwardIcon } from '@sanity/icons/ChartUpward'
import { defineField, defineType } from 'sanity'

export const stat = defineType({
  name: 'stat',
  title: 'رقم ثقة',
  type: 'object',
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: 'value',
      title: 'القيمة',
      type: 'string',
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: 'label',
      title: 'الوصف',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
  ],
  preview: { select: { title: 'value', subtitle: 'label' } },
})
