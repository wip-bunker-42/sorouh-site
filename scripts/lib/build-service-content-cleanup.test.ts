import { expect, test } from 'vitest'

import { articles, services } from '../../content/sorouh/site-content'
import {
  buildServiceContentCleanupPlan,
  type CleanupDocument,
} from './build-service-content-cleanup'

const document = (_id: string, _type: string, fields = {}): CleanupDocument => ({
  _id,
  _type,
  _rev: `revision-${_id}`,
  ...fields,
})
const image = { _type: 'contentImage', asset: { _type: 'reference', _ref: 'image-original' } }

test('withdraws unsupported published documents into drafts while preserving their originals', () => {
  const originals = [
    document('service-roof-insulation', 'service', { heroImage: image }),
    document('service-water-leak-detection', 'service'),
    document('service-area-custom-insulation', 'serviceAreaLanding', {
      service: { _type: 'reference', _ref: 'service-roof-insulation' },
    }),
    document('post-roof-insulation-guide', 'post', {
      relatedServices: [{ _type: 'reference', _ref: 'service-roof-insulation' }],
    }),
  ]
  const plan = buildServiceContentCleanupPlan(originals)

  expect(plan.withdrawals.map((entry) => entry.id).sort()).toEqual(
    originals.map((entry) => entry._id).sort(),
  )
  const landing = plan.withdrawals.find((entry) => entry.id === 'service-area-custom-insulation')!
  expect(landing.draft).toMatchObject({
    _id: 'drafts.service-area-custom-insulation',
    service: { _ref: 'service-roof-insulation', _weak: true },
  })
  expect(landing.draft).not.toHaveProperty('_rev')
  expect(
    plan.withdrawals.find((entry) => entry.id === 'service-roof-insulation')!.draft.heroImage,
  ).toEqual(image)
  expect(plan.originals).toEqual(expect.arrayContaining(originals))
  expect(originals[2]!.service).not.toHaveProperty('_weak')
})

test('removes withdrawn references from nested public arrays without changing retained reference keys', () => {
  const plan = buildServiceContentCleanupPlan([
    document('service-roof-insulation', 'service'),
    document('homePage', 'homePage', {
      featuredServices: [
        { _type: 'reference', _key: 'keep', _ref: 'service-plumbing' },
        { _type: 'reference', _key: 'remove', _ref: 'service-roof-insulation' },
      ],
      sections: [
        {
          _key: 'section',
          cards: [{ _ref: 'service-roof-insulation' }, { _ref: 'service-gypsum-board' }],
        },
      ],
    }),
  ])
  expect(plan.patches.find((entry) => entry.id === 'homePage')!.set).toMatchObject({
    featuredServices: [{ _type: 'reference', _key: 'keep', _ref: 'service-plumbing' }],
    sections: [{ _key: 'section', cards: [{ _ref: 'service-gypsum-board' }] }],
  })
})

test('keeps service identity, URL, media and existing SEO fields when changing qualified copy', () => {
  const original = document('service-concrete-cutting', 'service', {
    slug: { current: 'قص-الخرسانة-بالمنشار-والليزر' },
    heroImage: image,
    seo: { _type: 'seo', shareImage: image, custom: 'retain' },
  })
  const plan = buildServiceContentCleanupPlan([original])
  const patch = plan.patches.find((entry) => entry.id === original._id)!

  expect(patch.set.title).toBe('قص الخرسانة بالمنشار الماسي')
  expect(patch.set).not.toHaveProperty('slug')
  expect(patch.set).not.toHaveProperty('heroImage')
  expect(patch.set).not.toHaveProperty('_id')
  expect(patch.set.seo).toMatchObject({ shareImage: image, custom: 'retain' })
  expect(plan.originals).toContainEqual(original)
})

test('removes device-based leak detection from the moisture article while retaining its CMS ID and URL', () => {
  const original = document('post-water-leak-before-renovation', 'post', {
    slug: { current: 'علامات-تسرب-المياه-قبل-الترميم' },
    featuredImage: image,
  })
  const patch = buildServiceContentCleanupPlan([original]).patches[0]!
  const body = decodeURIComponent(JSON.stringify(patch.set.body))

  expect(patch.id).toBe(original._id)
  expect(patch.set).not.toHaveProperty('slug')
  expect(patch.set).not.toHaveProperty('featuredImage')
  expect(body).toContain('/الخدمات/اعمال-السباكة/')
  expect(body).not.toContain('/الخدمات/كشف-ومعالجة-تسربات-المياه/')
  expect(JSON.stringify(patch.set.relatedServices)).not.toContain('water-leak-detection')
})

test('replaces unsupported availability and statistics with factual nonempty renderable arrays', () => {
  const patch = buildServiceContentCleanupPlan([
    document('siteSettings', 'siteSettings', {
      availability: 'على مدار الساعة طوال أيام الأسبوع',
      stats: [{ _type: 'stat', _key: 'existing', value: '+75', label: 'مشروعًا' }],
    }),
  ]).patches[0]!

  expect(patch.set.availability).toBe('تواصل عبر الاتصال أو واتساب لتنسيق المعاينة')
  expect(patch.set.stats).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _type: 'stat',
        value: expect.any(String),
        label: expect.any(String),
      }),
    ]),
  )
  expect(JSON.stringify(patch.set.stats)).not.toMatch(/75|180,000|94%|35/)
})

test('refuses to overwrite an existing draft when withdrawing a published document', () => {
  expect(() =>
    buildServiceContentCleanupPlan([
      document('service-roof-insulation', 'service'),
      document('drafts.service-roof-insulation', 'service', { title: 'Unreviewed draft' }),
    ]),
  ).toThrow('Existing draft needs review: drafts.service-roof-insulation')
})

test('is idempotent after applying the planned patches and withdrawals locally', () => {
  const originals = [
    document('service-roof-insulation', 'service'),
    document('service-plumbing', 'service'),
    document('post-water-leak-before-renovation', 'post'),
  ]
  const plan = buildServiceContentCleanupPlan(originals)
  const withdrawn = new Set(plan.withdrawals.map((entry) => entry.id))
  const patched = originals
    .filter((entry) => !withdrawn.has(entry._id))
    .map((entry) => ({
      ...entry,
      ...plan.patches.find((patch) => patch.id === entry._id)?.set,
    }))
  const repeated = buildServiceContentCleanupPlan([
    ...patched,
    ...plan.withdrawals.map(
      (entry) => ({ ...entry.draft, _rev: 'new-draft-revision' }) as CleanupDocument,
    ),
  ])

  expect(repeated.patches).toEqual([])
  expect(repeated.withdrawals).toEqual([])
})

test('keeps qualified source content and owner relations free of unsupported services', () => {
  expect(services.map((entry) => entry.key)).not.toContain('roof-insulation')
  expect(services.map((entry) => entry.key)).not.toContain('water-leak-detection')
  expect(articles.map((entry) => entry.key)).not.toContain('roof-insulation-guide')
})

test('strips encoded unsupported links and their marks while preserving the visible text', () => {
  const plan = buildServiceContentCleanupPlan([
    document('post-unmanaged', 'post', {
      body: [
        {
          _type: 'block',
          _key: 'existing-block',
          children: [
            {
              _type: 'span',
              _key: 'existing-span',
              text: 'الرطوبة',
              marks: ['old-link', 'strong'],
            },
          ],
          markDefs: [
            {
              _key: 'old-link',
              _type: 'link',
              href: encodeURI('https://sorouh.site/الخدمات/كشف-ومعالجة-تسربات-المياه/'),
            },
          ],
        },
      ],
    }),
  ])
  expect(plan.patches[0]!.set.body).toEqual([
    {
      _type: 'block',
      _key: 'existing-block',
      children: [{ _type: 'span', _key: 'existing-span', text: 'الرطوبة', marks: ['strong'] }],
      markDefs: [],
    },
  ])
})

test('keeps existing article media references and project city evidence during cleanup', () => {
  const media = { _type: 'contentImage', _key: 'inline-media', ...image }
  const project = document('project-sorouh-building-plastering-01', 'project', {
    serviceArea: { _ref: 'area-eastern-province' },
    gallery: [image],
  })
  const plan = buildServiceContentCleanupPlan([
    document('post-water-leak-before-renovation', 'post', { body: [media] }),
    project,
  ])
  expect(
    plan.patches.find((entry) => entry.id === 'post-water-leak-before-renovation')!.set.body,
  ).toEqual(expect.arrayContaining([media]))
  const projectSet = plan.patches.find((entry) => entry.id === project._id)!.set
  expect(projectSet).not.toHaveProperty('serviceArea')
  expect(projectSet).not.toHaveProperty('gallery')
})

test('removes the legacy laser method from project scope while retaining its actual regional attribution', () => {
  const original = document('project-sorouh-concrete-saw-01', 'project', {
    scope: ['قص الخرسانة بالمنشار والليزر'],
    serviceArea: { _ref: 'area-eastern-province' },
    gallery: [image],
  })
  const patch = buildServiceContentCleanupPlan([original]).patches[0]
  expect(patch).toBeDefined()
  expect(patch!.set.scope).toEqual(['قص الخرسانة بالمنشار الماسي'])
  expect(patch!.set).not.toHaveProperty('serviceArea')
  expect(patch!.set).not.toHaveProperty('gallery')
})

test('refuses withdrawal when another unpublished draft still strongly references that document', () => {
  expect(() =>
    buildServiceContentCleanupPlan([
      document('service-roof-insulation', 'service'),
      document('drafts.editor-work', 'post', {
        relatedServices: [{ _ref: 'service-roof-insulation' }],
      }),
    ]),
  ).toThrow('Draft references need review: drafts.editor-work')
})
