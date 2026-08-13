import { SearchIcon } from '@sanity/icons/Search'
import { defineField, defineType } from 'sanity'

import { SeoFieldInput } from '../../components/seo-field'

export const seo = defineType({
  name: 'seo',
  title: 'بيانات تحسين الظهور',
  type: 'object',
  icon: SearchIcon,
  components: { input: SeoFieldInput },
  groups: [
    { name: 'basic', title: 'أساسي', default: true },
    { name: 'advanced', title: 'متقدم' },
  ],
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'عنوان نتائج البحث',
      type: 'string',
      group: 'basic',
      validation: (rule) => rule.max(60).warning('يفضل ألا يتجاوز العنوان 60 حرفًا'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'وصف نتائج البحث',
      type: 'text',
      rows: 3,
      group: 'basic',
      validation: (rule) =>
        rule
          .min(70)
          .warning('الوصف الأقصر قد لا يوضح قيمة الصفحة')
          .max(160)
          .warning('يفضل ألا يتجاوز الوصف 160 حرفًا'),
    }),
    defineField({
      name: 'shareImage',
      title: 'صورة المشاركة',
      type: 'contentImage',
      group: 'basic',
    }),
    defineField({
      name: 'noIndex',
      title: 'منع الفهرسة',
      description: 'اتركه غير مفعّل للصفحات العامة المراد ظهورها في البحث.',
      type: 'boolean',
      group: 'advanced',
      initialValue: false,
    }),
    defineField({
      name: 'canonicalOverride',
      title: 'تجاوز الرابط الأساسي',
      description: 'اختياري ومتقدم؛ الموقع ينشئ الرابط الأساسي تلقائيًا في الوضع الطبيعي.',
      type: 'url',
      group: 'advanced',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
  ],
})
