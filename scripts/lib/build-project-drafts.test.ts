import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

import { sourceAssets } from '../../content/sorouh/asset-manifest'
import { projectDrafts } from '../../content/sorouh/project-evidence'

import { validateProjectDrafts, type ProjectDraft, type ReviewEntry } from './build-project-drafts'

const completeDraft: ProjectDraft = {
  sourceKey: 'project-001',
  title: 'تركيب بورسلان رخامي في الدمام',
  slug: 'تركيب-بورسلان-رخامي-الدمام',
  summary: 'تنفيذ تكسية بورسلان متناسقة لحمام في الدمام مع ضبط الفواصل والتفاصيل النهائية.',
  description:
    'شملت الأعمال تجهيز الأسطح وتخطيط التوزيع وتركيب البورسلان ومراجعة الميول والفواصل قبل التسليم.',
  classification: 'تركيب سيراميك وبورسلان',
  serviceKeys: ['tile-porcelain'],
  areaKey: 'dammam',
  stages: ['المعاينة ورفع المقاسات', 'تجهيز الأسطح', 'التركيب والمراجعة النهائية'],
  result: 'تشطيب متناسق بسطوح نظيفة وتفاصيل دقيقة حول الزوايا والتجهيزات الصحية.',
  mediaKeys: ['porcelain-dammam-bath'],
  seo: {
    metaTitle: 'تركيب بورسلان حمام في الدمام | صروح الشرقية',
    metaDescription:
      'شاهد تفاصيل مشروع تركيب بورسلان رخامي لحمام في الدمام ومراحل التجهيز والتنفيذ والمراجعة النهائية.',
    shareMediaKey: 'porcelain-dammam-bath',
  },
}

const completeReviews: ReviewEntry[] = [
  {
    sourceKey: 'project-001',
    field: 'areaKey',
    chosenValue: 'dammam',
    evidence: ['اسم الملف'],
    confidence: 'high',
  },
  {
    sourceKey: 'project-001',
    field: 'classification',
    chosenValue: 'تركيب سيراميك وبورسلان',
    evidence: ['اسم المجلد'],
    confidence: 'high',
  },
  {
    sourceKey: 'project-001',
    field: 'stages',
    chosenValue: 'المعاينة، التجهيز، التركيب',
    evidence: ['تسلسل الصور'],
    confidence: 'medium',
  },
  {
    sourceKey: 'project-001',
    field: 'result',
    chosenValue: 'تشطيب متناسق',
    evidence: ['الصورة النهائية'],
    confidence: 'medium',
  },
]

describe('validateProjectDrafts', () => {
  test('validates the complete audited Sorouh project set', () => {
    const register = JSON.parse(
      readFileSync(new URL('../../content/sorouh/review-register.json', import.meta.url), 'utf8'),
    ) as { entries: ReviewEntry[] }

    expect(validateProjectDrafts(projectDrafts, register.entries, sourceAssets)).toEqual({
      projects: 11,
      assignedMedia: 18,
      unassignedMedia: 0,
    })
  })

  test('accepts a complete Arabic project with matching evidence', () => {
    expect(
      validateProjectDrafts([completeDraft], completeReviews, [
        { key: 'porcelain-dammam-bath', usage: 'project' },
      ]),
    ).toEqual({ projects: 1, assignedMedia: 1, unassignedMedia: 0 })
  })

  test('rejects duplicate source keys', () => {
    expect(() =>
      validateProjectDrafts([completeDraft, { ...completeDraft }], completeReviews, [
        { key: 'porcelain-dammam-bath', usage: 'project' },
      ]),
    ).toThrow('Duplicate project sourceKey: project-001')
  })

  test.each([
    ['title', ''],
    ['summary', 'English only'],
    ['description', ''],
    ['classification', ''],
    ['serviceKeys', []],
    ['areaKey', ''],
    ['stages', []],
    ['result', ''],
    ['mediaKeys', []],
  ] as const)('rejects an incomplete %s', (field, value) => {
    expect(() =>
      validateProjectDrafts([{ ...completeDraft, [field]: value }], completeReviews, [
        { key: 'porcelain-dammam-bath', usage: 'project' },
      ]),
    ).toThrow(`project-001.${field}`)
  })

  test('requires complete SEO and an existing share media key', () => {
    expect(() =>
      validateProjectDrafts(
        [{ ...completeDraft, seo: { ...completeDraft.seo, metaDescription: '' } }],
        completeReviews,
        [{ key: 'porcelain-dammam-bath', usage: 'project' }],
      ),
    ).toThrow('project-001.seo.metaDescription')
  })

  test('requires review evidence for inferred editorial fields', () => {
    expect(() =>
      validateProjectDrafts([completeDraft], completeReviews.slice(0, 2), [
        { key: 'porcelain-dammam-bath', usage: 'project' },
      ]),
    ).toThrow('Missing review entry: project-001.stages')
  })

  test('rejects unassigned or multiply assigned usable project media', () => {
    expect(() =>
      validateProjectDrafts([completeDraft], completeReviews, [
        { key: 'porcelain-dammam-bath', usage: 'project' },
        { key: 'unassigned-image', usage: 'project' },
      ]),
    ).toThrow('Unassigned project media: unassigned-image')

    expect(() =>
      validateProjectDrafts(
        [completeDraft, { ...completeDraft, sourceKey: 'project-002' }],
        [
          ...completeReviews,
          ...completeReviews.map((entry) => ({ ...entry, sourceKey: 'project-002' })),
        ],
        [{ key: 'porcelain-dammam-bath', usage: 'project' }],
      ),
    ).toThrow('Media assigned to multiple projects: porcelain-dammam-bath')
  })
})
