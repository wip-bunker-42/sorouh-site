import { ProjectsIcon } from '@sanity/icons/Projects'
import { defineArrayMember, defineField, defineType } from 'sanity'

import {
  contentGroups,
  redirectFromField,
  seoField,
  slugField,
  summaryField,
  titleField,
} from '../shared'

type ProjectMediaValue = {
  gallery?: unknown[]
  videos?: unknown[]
}

export function validateProjectMedia(value?: ProjectMediaValue): true | string {
  return (value?.gallery?.length ?? 0) > 0 || (value?.videos?.length ?? 0) > 0
    ? true
    : 'أضف صورة واحدة أو فيديو يوتيوب واحدًا على الأقل'
}

export const project = defineType({
  name: 'project',
  title: 'مشروع',
  type: 'document',
  icon: ProjectsIcon,
  groups: contentGroups,
  fields: [
    titleField,
    slugField,
    summaryField,
    defineField({
      name: 'sourceKey',
      title: 'مفتاح المصدر',
      description: 'معرّف داخلي ثابت للمادة الخام والمراجعة.',
      type: 'string',
      group: 'technical',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'classification',
      title: 'تصنيف المشروع',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().min(3).max(80),
    }),
    defineField({
      name: 'workDescription',
      title: 'وصف الأعمال المنفذة',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'scope',
      title: 'نطاق العمل',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(3).max(12),
    }),
    defineField({
      name: 'stages',
      title: 'مراحل التنفيذ',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(3).max(10),
    }),
    defineField({
      name: 'result',
      title: 'نتيجة المشروع',
      type: 'text',
      rows: 4,
      group: 'content',
      validation: (rule) => rule.required().min(50).max(500),
    }),
    defineField({
      name: 'services',
      title: 'الخدمات المنفذة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'serviceArea',
      title: 'المدينة أو منطقة الخدمة',
      type: 'reference',
      group: 'content',
      to: [{ type: 'serviceArea' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'معرض الصور',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({ type: 'contentImage' })],
    }),
    defineField({
      name: 'videos',
      title: 'الفيديوهات',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({ type: 'youtubeVideo' })],
    }),
    defineField({
      name: 'featured',
      title: 'مشروع مميز',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'relatedProjects',
      title: 'مشاريع مرتبطة',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    seoField,
    redirectFromField,
  ],
  validation: (rule) =>
    rule.custom((value) => validateProjectMedia(value as ProjectMediaValue | undefined)),
  preview: {
    select: { title: 'title', subtitle: 'classification', media: 'gallery.0' },
  },
})
