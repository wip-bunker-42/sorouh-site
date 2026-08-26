import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, test } from 'vitest'

import { normalizeSnapshot } from '../content/normalize'
import { validateRawSnapshot } from '../content/validate'
import { validateRenderContract } from '../content/contract'
import { createBuildClient } from '../../sanity/client'

type MutableSnapshot = Record<string, any>
const fixturePath = fileURLToPath(
  new URL('../../../tests/fixtures/site-snapshot.json', import.meta.url),
)
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as MutableSnapshot

let raw: MutableSnapshot

beforeEach(() => {
  raw = structuredClone(fixture)
})

describe('published content snapshot', () => {
  test('requires production Sanity environment when no fixture is selected', () => {
    expect(() => createBuildClient({})).toThrow(
      'PUBLIC_SANITY_PROJECT_ID is required for a production content build',
    )
  })

  test('locks the production client to the reviewed static-build configuration', () => {
    const config = createBuildClient({
      PUBLIC_SANITY_PROJECT_ID: 'ki7bs4vk',
      PUBLIC_SANITY_DATASET: 'production',
    }).config()

    expect(config).toMatchObject({
      projectId: 'ki7bs4vk',
      dataset: 'production',
      apiVersion: '2026-08-13',
      useCdn: false,
      perspective: 'published',
    })
  })

  test('excludes drafts and retains noIndex for discovery filtering', () => {
    raw.services.push({ ...raw.services[0], _id: 'drafts.fixture-service-copy' })
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
    expect(snapshot.services).toHaveLength(1)
    expect(snapshot.services[0]!.seo.noIndex).toBe(true)
  })

  test('fails when a required singleton is missing', () => {
    delete raw.homePage
    expect(() => validateRawSnapshot(raw)).toThrow('Missing singleton: homePage')
  })

  test('fails on duplicate slugs within the same route collection', () => {
    raw.services.push({ ...raw.services[0], _id: 'other-service' })
    expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
      'Duplicate service slug: مقاولات-عامة',
    )
  })

  test('fails on duplicate service-area landing pairs', () => {
    raw.serviceAreaLandings = [
      {
        _id: 'fixture-local-page',
        _type: 'serviceAreaLanding',
        _updatedAt: '2026-08-26T00:00:00.000Z',
        title: 'مقاول مقاولات عامة في الدمام',
        summary: 'صفحة محلية توضح تنفيذ أعمال المقاولات العامة في الدمام بنطاق واضح وخطوات منظمة.',
        service: { _id: 'fixture-service', title: 'مقاولات عامة', slug: 'مقاولات-عامة' },
        serviceArea: { _id: 'fixture-area', title: 'الدمام', slug: 'الدمام' },
        heroImage: raw.projects[0].gallery[0],
        intro: raw.projects[0].workDescription,
        deliverables: ['معاينة الموقع', 'تحديد النطاق', 'تنفيذ الأعمال', 'المراجعة والتسليم'],
        process: ['المعاينة', 'التنفيذ', 'المراجعة'],
        faqs: [
          { question: 'هل تتوفر الخدمة في الدمام؟', answer: 'نعم، بعد تحديد النطاق والمعاينة.' },
          { question: 'كيف يبدأ العمل؟', answer: 'بمعاينة الموقع وتوضيح البنود المطلوبة.' },
          {
            question: 'هل تشمل الخدمة المراجعة؟',
            answer: 'تتم مراجعة البنود ضمن نطاق العمل المتفق عليه.',
          },
        ],
        seo: { noIndex: false },
      },
    ]
    raw.serviceAreaLandings.push({
      ...raw.serviceAreaLandings[0],
      _id: 'duplicate-local-page',
    })

    expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
      'Duplicate serviceAreaLanding pair: fixture-service/fixture-area',
    )
  })

  test('warns for missing optional related references', () => {
    raw.posts[0].relatedPosts = [{ _id: 'missing-related-post' }]
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
    expect(snapshot.warnings).toContain(
      'post fixture-post references missing optional post missing-related-post',
    )
  })

  test('fails when a required project reference is absent', () => {
    raw.projects[0].services = []
    expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
      'Project fixture-project-001 is incomplete: services',
    )
  })

  test('names the exact project source key and every incomplete field', () => {
    delete raw.projects[0].title
    delete raw.projects[0].result
    raw.projects[0].gallery = []
    raw.projects[0].videos = []
    expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
      'Project fixture-project-001 is incomplete: title, result, media',
    )
  })

  test('omits aggregate lastmod because collection pages change for many reasons', () => {
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
    expect(snapshot.aggregateLastmod).toEqual({})
  })

  test('treats SEO fields as optional overrides with content and image fallbacks', () => {
    raw.homePage.heroSummary = 'ملخص واضح لخدمات المقاولات والبناء والترميم في المنطقة الشرقية.'
    raw.homePage.heroImage = { asset: { url: 'https://cdn.sanity.io/images/example/home.jpg' } }
    delete raw.homePage.seo
    delete raw.services[0].seo
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))

    expect(snapshot.homePage.seo).toMatchObject({
      metaTitle: raw.homePage.heroTitle,
      metaDescription: raw.homePage.heroSummary,
      noIndex: false,
    })
    expect(snapshot.homePage.seo.shareImage).toEqual(raw.homePage.heroImage)
    expect(snapshot.services[0]!.seo.metaTitle).toBe(raw.services[0].title)
    expect(snapshot.services[0]!.seo.metaDescription).toBe(raw.services[0].summary)
    expect(snapshot.services[0]!.seo.shareImage).toEqual(raw.services[0].heroImage)
  })

  test('excludes scheduled posts consistently before route generation', () => {
    raw.posts.push({
      ...raw.posts[0],
      _id: 'future-post',
      slug: 'future-post',
      publishedAt: '2030-01-01T00:00:00.000Z',
    })
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw), new Date('2026-08-13T00:00:00Z'))
    expect(snapshot.posts.map((post) => post._id)).not.toContain('future-post')
  })

  test('fails before Astro when a field consumed by a page is missing', () => {
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
    expect(() => validateRenderContract(snapshot)).toThrow(
      'Published content is missing render field',
    )
  })
})
