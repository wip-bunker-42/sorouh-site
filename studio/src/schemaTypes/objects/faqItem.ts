import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { defineField, defineType } from 'sanity'

export const faqItem = defineType({
  name: 'faqItem',
  title: 'سؤال شائع',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'السؤال',
      type: 'string',
      validation: (rule) => rule.required().min(10).max(180),
    }),
    defineField({
      name: 'answer',
      title: 'الإجابة',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(30).max(700),
    }),
  ],
  preview: { select: { title: 'question', subtitle: 'answer' } },
})
