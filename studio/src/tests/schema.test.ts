import { createSchema } from 'sanity'
import { describe, expect, test } from 'vitest'

import {
  DATASET,
  SANITY_API_VERSION,
  SINGLETONS,
  filterSingletonActions,
  filterSingletonTemplates,
} from '../constants'
import { schemaTypes } from '../schemaTypes'
import { validateProjectMedia } from '../schemaTypes/documents/project'
import { validateYouTubeVideoMetadata } from '../schemaTypes/objects/youtubeVideo'

const compiledSchema = createSchema({ name: 'sorouh', types: schemaTypes })

function rawType(name: string) {
  const type = schemaTypes.find((candidate) => candidate.name === name)
  if (!type) throw new Error(`Missing schema type: ${name}`)
  return type as typeof type & { fields?: Array<{ name: string; validation?: unknown }> }
}

function expectRequiredFields(typeName: string, fieldNames: string[]) {
  const fields = rawType(typeName).fields ?? []
  for (const fieldName of fieldNames) {
    const field = fields.find((candidate) => candidate.name === fieldName)
    expect(field, `${typeName}.${fieldName}`).toBeDefined()
    expect(field?.validation, `${typeName}.${fieldName} validation`).toBeTypeOf('function')
  }
}

describe('Sanity content model', () => {
  test('compiles every approved document and object type', () => {
    const expectedTypes = [
      'siteSettings',
      'homePage',
      'aboutPage',
      'contactPage',
      'service',
      'serviceArea',
      'project',
      'category',
      'post',
      'redirect',
      'seo',
      'contentImage',
      'faqItem',
      'cta',
      'stat',
      'youtubeVideo',
      'portableText',
    ]

    for (const typeName of expectedTypes) expect(compiledSchema.get(typeName)).toBeDefined()
  })

  test('locks the reviewed API, dataset, and singleton set', () => {
    expect(SANITY_API_VERSION).toBe('2026-08-13')
    expect(DATASET).toBe('production')
    expect(SINGLETONS).toEqual(['siteSettings', 'homePage', 'aboutPage', 'contactPage'])
  })

  test('removes create, delete, and duplicate entry points for singletons only', () => {
    const actions = [
      { action: 'publish' },
      { action: 'delete' },
      { action: 'duplicate' },
      { action: 'discardChanges' },
    ]
    expect(filterSingletonActions(actions, 'siteSettings').map((item) => item.action)).toEqual([
      'publish',
      'discardChanges',
    ])
    expect(filterSingletonActions(actions, 'service')).toEqual(actions)

    const templates = [
      { templateId: 'siteSettings' },
      { templateId: 'service' },
      { templateId: 'post' },
    ]
    expect(filterSingletonTemplates(templates).map((item) => item.templateId)).toEqual([
      'service',
      'post',
    ])
  })

  test('requires slugs and the post taxonomy and publication date', () => {
    for (const typeName of ['service', 'serviceArea', 'project', 'category', 'post']) {
      expectRequiredFields(typeName, ['slug'])
    }
    expectRequiredFields('post', ['category', 'publishedAt'])
  })

  test('requires Arabic alt text for every content image', () => {
    expectRequiredFields('contentImage', ['alt'])
  })

  test('does not cap featured services at the launch inventory', () => {
    const field = (rawType('serviceArea').fields ?? []).find(
      (item) => item.name === 'featuredServices',
    )
    expect(field?.validation).toBeTypeOf('function')
    expect(String(field?.validation)).not.toContain('max(13)')
  })

  test('requires a complete visitor-facing project and at least one media item', () => {
    expectRequiredFields('project', [
      'title',
      'slug',
      'summary',
      'workDescription',
      'classification',
      'services',
      'serviceArea',
      'result',
    ])
    expect(validateProjectMedia({})).toBe('أضف صورة واحدة أو فيديو يوتيوب واحدًا على الأقل')
    expect(validateProjectMedia({ gallery: [{ _type: 'contentImage' }] })).toBe(true)
    expect(validateProjectMedia({ videos: [{ _type: 'youtubeVideo' }] })).toBe(true)
  })

  test('requires useful metadata whenever a YouTube URL is present', () => {
    expect(validateYouTubeVideoMetadata({ url: 'https://youtu.be/IK7jw0fu3zE' })).toBe(
      'عنوان الفيديو ووصفه مطلوبان عند إضافة رابط يوتيوب',
    )
    expect(
      validateYouTubeVideoMetadata({
        url: 'https://youtu.be/IK7jw0fu3zE',
        title: 'تنفيذ أعمال تشطيب',
        description: 'لقطات توضح مراحل التنفيذ داخل المشروع.',
      }),
    ).toBe(true)
  })

  test('keeps SEO focused and canonical override advanced', () => {
    const fields = rawType('seo').fields ?? []
    const names = fields.map((field) => field.name)
    expect(names).toEqual([
      'metaTitle',
      'metaDescription',
      'shareImage',
      'noIndex',
      'canonicalOverride',
    ])
    expect(names).not.toContain('primaryKeyword')
    expect(names).not.toContain('synonyms')
    expect(names).not.toContain('metaKeywords')
  })
})
