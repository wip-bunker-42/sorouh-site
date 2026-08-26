import { expect, test } from 'vitest'

import {
  buildEditorialContentWave,
  type EditorialContentWaveInput,
} from './build-editorial-content-wave'

const input = (): EditorialContentWaveInput => ({
  articles: [
    {
      key: 'roof-insulation-guide',
      title: 'دليل عزل الأسطح',
      slug: 'دليل-اختيار-عزل-الاسطح',
      excerpt: 'دليل عملي لاختيار عزل الأسطح بعد فحص الميول والمصارف والطبقات القائمة.',
      categoryKey: 'construction',
      areaKey: 'eastern-province',
      publishedAt: '2026-08-12T07:00:00.000Z',
      markdown: '## مقدمة\n\nمحتوى مفيد.\n\n[[CTA]]\n\n## خاتمة\n\nخلاصة عملية.',
    },
  ],
  relations: new Map([
    [
      'roof-insulation-guide',
      { serviceKeys: ['roof-insulation'], relatedPostKeys: ['water-leak-before-renovation'] },
    ],
  ]),
  categoryIds: new Map([['construction', 'category-construction']]),
  areaIds: new Map([['eastern-province', 'area-eastern-province']]),
  serviceIds: new Map([['roof-insulation', 'service-roof-insulation']]),
  postIds: new Map([['water-leak-before-renovation', 'post-water-leak-before-renovation']]),
  images: new Map([
    [
      'roof-insulation-guide',
      { _type: 'contentImage', asset: { _type: 'reference', _ref: 'image-roof' }, alt: 'سطح مجهز' },
    ],
  ]),
  existingIds: new Set(),
  author: 'شركة صروح الشرقية للمقاولات',
})

test('builds an indexable article with its internal references and CTA blocks', () => {
  const plan = buildEditorialContentWave(input())

  expect(plan.creates).toHaveLength(1)
  expect(plan.creates[0]).toMatchObject({
    _id: 'post-roof-insulation-guide',
    _type: 'post',
    slug: { current: 'دليل-اختيار-عزل-الاسطح' },
    category: { _ref: 'category-construction' },
    serviceArea: { _ref: 'area-eastern-province' },
    relatedServices: [{ _ref: 'service-roof-insulation' }],
    relatedPosts: [{ _ref: 'post-water-leak-before-renovation' }],
  })
  expect(plan.creates[0]!.body).toEqual(
    expect.arrayContaining([expect.objectContaining({ _type: 'cta' })]),
  )
})

test('refuses to recreate an existing post', () => {
  const fixture = input()
  fixture.existingIds.add('post-roof-insulation-guide')

  expect(() => buildEditorialContentWave(fixture)).toThrow(
    'Refusing to recreate existing post: post-roof-insulation-guide',
  )
})

test('rejects an article with a missing related service', () => {
  const fixture = input()
  fixture.serviceIds.clear()

  expect(() => buildEditorialContentWave(fixture)).toThrow(
    'Missing related service: roof-insulation',
  )
})
