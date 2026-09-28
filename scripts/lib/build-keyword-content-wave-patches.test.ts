import { expect, test } from 'vitest'

import {
  buildKeywordContentWavePlan,
  type KeywordContentWavePlannerInput,
} from './build-keyword-content-wave-patches'

const entry = (key: string, serviceKey: string, areaKey: string) => ({
  key,
  mode: 'create' as const,
  targetId: key,
  primaryKeyword: key,
  title: key,
  serviceKey,
  areaKey,
  summary: `${key} summary`,
  localAngle: `${key} local angle`,
  deliverables: ['one', 'two', 'three', 'four'],
  process: ['one', 'two', 'three', 'four'],
  faqs: [{ question: 'question', answer: 'answer' }],
})

const input = (): KeywordContentWavePlannerInput => ({
  entries: [
    entry('plumbing-dammam', 'plumbing', 'dammam'),
    entry('electrical-dammam', 'electrical', 'dammam'),
  ],
  improvements: [
    {
      key: 'annex-dammam',
      mode: 'improve',
      targetId: 'annex-dammam',
      primaryKeyword: 'بناء ملاحق الدمام',
      title: 'بناء ملاحق في الدمام',
      summary: 'تحسين صفحة قائمة',
      additionalFaqs: [{ question: 'سؤال جديد', answer: 'إجابة جديدة' }],
      internalLinkTargets: ['مقاول-بناء'],
    },
  ],
  serviceDocuments: new Map([
    ['plumbing', { id: 'service-plumbing', heroImage: { _type: 'contentImage', alt: 'سباكة' } }],
    [
      'electrical',
      { id: 'service-electrical', heroImage: { _type: 'contentImage', alt: 'كهرباء' } },
    ],
  ]),
  areaDocuments: new Map([['dammam', { id: 'area-dammam' }]]),
  existingLandingDocuments: new Map([
    [
      'service-area-annex-dammam',
      { faqs: [{ _type: 'faqItem', _key: 'old-01', question: 'قديم', answer: 'قديم' }], seo: {} },
    ],
  ]),
  existingIds: new Set(['service-area-annex-dammam']),
})

test('builds only missing documents and named existing-owner improvements', () => {
  const plan = buildKeywordContentWavePlan(input())

  expect(plan.creates.map((item) => item._id)).toContain('service-area-plumbing-dammam')
  expect(plan.patches.map((item) => item.id)).toEqual(['service-area-annex-dammam'])
  expect(plan.unchanged).toEqual([])
  expect(plan.creates[0]).toMatchObject({
    _type: 'serviceAreaLanding',
    service: { _ref: 'service-plumbing' },
    serviceArea: { _ref: 'area-dammam' },
  })
})

test('refuses to recreate an existing document', () => {
  const fixture = input()
  fixture.existingIds.add('service-area-plumbing-dammam')

  expect(() => buildKeywordContentWavePlan(fixture)).toThrow(
    'Refusing to recreate existing document: service-area-plumbing-dammam',
  )
})

test('refuses a create when its referenced service is missing', () => {
  const fixture = input()
  fixture.serviceDocuments.delete('plumbing')

  expect(() => buildKeywordContentWavePlan(fixture)).toThrow(
    'Missing service document for keyword content: plumbing',
  )
})

test('includes decision sections inside the landing intro without changing the service reference', () => {
  const fixture = input()
  fixture.entries = [
    {
      ...fixture.entries[0]!,
      planning: [{ title: 'قبل التنفيذ', body: 'راجع نقاط التغذية والصرف.' }],
    },
  ]
  const created = buildKeywordContentWavePlan(fixture).creates[0]!

  expect(created.service).toEqual({ _type: 'reference', _ref: 'service-plumbing' })
  expect(created.intro).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        style: 'h2',
        children: [expect.objectContaining({ text: 'قبل التنفيذ' })],
      }),
      expect.objectContaining({
        style: 'normal',
        children: [expect.objectContaining({ text: 'راجع نقاط التغذية والصرف.' })],
      }),
    ]),
  )
})
