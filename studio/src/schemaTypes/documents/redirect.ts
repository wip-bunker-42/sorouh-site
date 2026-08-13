import { LinkIcon } from '@sanity/icons/Link'
import { defineField, defineType } from 'sanity'

const internalPath = /^\/(?!\/)(?:[^?#]*\/)?$/

export const redirect = defineType({
  name: 'redirect',
  title: 'تحويل مسار تقني',
  type: 'document',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'source',
      title: 'المسار القديم',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .regex(internalPath)
          .custom((value) => (value === '/' ? 'لا يمكن تحويل الصفحة الرئيسية' : true)),
    }),
    defineField({
      name: 'destination',
      title: 'المسار الجديد',
      type: 'string',
      validation: (rule) => rule.required().regex(internalPath),
    }),
    defineField({
      name: 'status',
      title: 'نوع التحويل',
      type: 'number',
      options: {
        layout: 'radio',
        list: [
          { title: 'دائم 301', value: 301 },
          { title: 'مؤقت 302', value: 302 },
        ],
      },
      initialValue: 301,
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: 'note',
      title: 'ملاحظة داخلية',
      type: 'string',
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: { select: { title: 'source', subtitle: 'destination' } },
})
