import { PlayIcon } from '@sanity/icons/Play'
import { defineField, defineType } from 'sanity'

type YouTubeVideoValue = {
  url?: string
  title?: string
  description?: string
}

export function validateYouTubeVideoMetadata(value?: YouTubeVideoValue): true | string {
  if (!value?.url) return true
  if (!value.title?.trim() || !value.description?.trim()) {
    return 'عنوان الفيديو ووصفه مطلوبان عند إضافة رابط يوتيوب'
  }
  return true
}

export const youtubeVideo = defineType({
  name: 'youtubeVideo',
  title: 'فيديو يوتيوب',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'رابط يوتيوب',
      type: 'url',
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ['https'] })
          .custom((value) => {
            if (!value) return true
            try {
              const host = new URL(value).hostname.replace(/^www\./, '')
              return ['youtube.com', 'youtu.be'].includes(host)
                ? true
                : 'استخدم رابطًا من YouTube فقط'
            } catch {
              return 'رابط يوتيوب غير صالح'
            }
          }),
    }),
    defineField({
      name: 'title',
      title: 'عنوان الفيديو',
      type: 'string',
      validation: (rule) => rule.required().min(5).max(100),
    }),
    defineField({
      name: 'description',
      title: 'وصف الفيديو',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().min(20).max(500),
    }),
    defineField({
      name: 'uploadDate',
      title: 'تاريخ نشر الفيديو',
      description: 'اختياري؛ يستخدم في البيانات المنظمة عند توفر تاريخ موثوق.',
      type: 'date',
    }),
    defineField({
      name: 'duration',
      title: 'المدة بصيغة ISO 8601',
      description: 'مثال: PT45S أو PT2M10S',
      type: 'string',
      validation: (rule) =>
        rule
          .regex(/^PT(?=\d)(?:(?:\d+)H)?(?:(?:\d+)M)?(?:(?:\d+)S)?$/)
          .warning('استخدم صيغة مثل PT45S'),
    }),
  ],
  validation: (rule) => rule.custom(validateYouTubeVideoMetadata),
  preview: { select: { title: 'title', subtitle: 'description' } },
})
