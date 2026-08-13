import { ImageIcon } from '@sanity/icons/Image'
import { defineField, defineType } from 'sanity'

export const contentImage = defineType({
  name: 'contentImage',
  title: 'صورة محتوى',
  type: 'image',
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'النص البديل بالعربية',
      description: 'صف ما يظهر في الصورة بوضوح دون حشو كلمات.',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .min(5)
          .max(180)
          .custom((value) =>
            !value || /[\u0600-\u06ff]/.test(value) ? true : 'اكتب النص البديل باللغة العربية',
          ),
    }),
    defineField({
      name: 'caption',
      title: 'تعليق الصورة',
      type: 'string',
      validation: (rule) => rule.max(180),
    }),
  ],
})
