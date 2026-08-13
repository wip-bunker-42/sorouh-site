import { BlockContentIcon } from '@sanity/icons/BlockContent'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const portableText = defineType({
  name: 'portableText',
  title: 'محتوى منسق',
  type: 'array',
  icon: BlockContentIcon,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'نص عادي', value: 'normal' },
        { title: 'عنوان رئيسي للقسم', value: 'h2' },
        { title: 'عنوان فرعي', value: 'h3' },
        { title: 'اقتباس', value: 'blockquote' },
      ],
      lists: [
        { title: 'نقاط', value: 'bullet' },
        { title: 'أرقام', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'عريض', value: 'strong' },
          { title: 'مائل', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'رابط',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'الرابط',
                type: 'url',
                validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
              }),
              defineField({
                name: 'openInNewTab',
                title: 'فتح في نافذة جديدة',
                type: 'boolean',
                initialValue: false,
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: 'contentImage' }),
    defineArrayMember({ type: 'cta' }),
    defineArrayMember({ type: 'youtubeVideo' }),
  ],
})
