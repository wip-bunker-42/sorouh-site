import { describe, expect, test } from 'vitest'

import type { SemanticMediaPlacement } from './semantic-media'
import {
  assertManagedContentImage,
  buildManagedContentImage,
  buildSemanticMediaPatch,
} from './build-semantic-media-patches'

const placement = (overrides: Partial<SemanticMediaPlacement> = {}): SemanticMediaPlacement => ({
  target: 'service-electrical',
  role: 'service',
  assetKey: 'electrical-video-still',
  topic: 'electrical',
  alt: 'تأسيس مواسير ولوحة الكهرباء داخل فيلا في الدمام',
  ...overrides,
})

describe('buildSemanticMediaPatch', () => {
  test.each([
    ['homePage', 'page', ['heroImage', 'seo.shareImage']],
    ['aboutPage', 'page', ['image', 'seo.shareImage']],
    ['service-electrical', 'service', ['heroImage', 'seo.shareImage']],
    ['area-dammam', 'area', ['image', 'seo.shareImage']],
    ['post-mep-before-finishing', 'post', ['featuredImage', 'seo.shareImage']],
  ] as const)('maps %s to its visual and social fields', (target, role, fields) => {
    const result = buildSemanticMediaPatch(placement({ target, role }), 'image-asset-id')

    expect(result.documentId).toBe(target)
    expect(Object.keys(result.set)).toEqual(fields)
    for (const value of Object.values(result.set)) {
      expect(value).toMatchObject({
        _type: 'contentImage',
        alt: expect.stringContaining('فيلا'),
        asset: { _type: 'reference', _ref: 'image-asset-id' },
        crop: { _type: 'sanity.imageCrop', top: 0, right: 0, bottom: 0, left: 0 },
        hotspot: { _type: 'sanity.imageHotspot', x: 0.5, y: 0.5, width: 1, height: 1 },
      })
    }
  })

  test('uses the real video still as the project gallery image and share image', () => {
    const result = buildSemanticMediaPatch(
      placement({
        target: 'project-sorouh-building-plastering-01',
        role: 'project',
        topic: 'building-plastering-project',
        alt: 'أعمال بناء ولياسة حقيقية موثقة من مشروع صروح الشرقية',
      }),
      'real-video-still-id',
    )

    expect(result.managedGalleryImage).toEqual(
      expect.objectContaining({
        _key: 'semantic-media-primary',
        asset: { _type: 'reference', _ref: 'real-video-still-id' },
      }),
    )
    expect(result.set).not.toHaveProperty('gallery')
    expect(result.set['seo.shareImage']).not.toHaveProperty('_key')
  })

  test('preserves the disclosure caption on generated visuals', () => {
    const result = buildSemanticMediaPatch(
      placement({ caption: 'صورة توضيحية لخدمة أعمال الكهرباء' }),
      'generated-id',
    )

    expect(result.set.heroImage).toMatchObject({
      caption: 'صورة توضيحية لخدمة أعمال الكهرباء',
    })
  })

  test('builds the same complete content image shape for seed and patch flows', () => {
    const result = buildSemanticMediaPatch(placement(), 'asset-id')
    expect(result.set.heroImage).toEqual(buildManagedContentImage(placement(), 'asset-id'))
  })

  test('rejects a malformed page target instead of guessing its field', () => {
    expect(() =>
      buildSemanticMediaPatch(placement({ target: 'contactPage', role: 'page' }), 'asset-id'),
    ).toThrow('Unsupported page media target: contactPage')
  })

  test('verification fails when any managed image metadata is lost', () => {
    const expected = buildManagedContentImage(placement(), 'asset-id')
    expect(() =>
      assertManagedContentImage({ ...expected, alt: '' }, expected, 'service.heroImage'),
    ).toThrow('service.heroImage.alt')
    expect(() =>
      assertManagedContentImage({ ...expected, hotspot: undefined }, expected, 'service.heroImage'),
    ).toThrow('service.heroImage.hotspot')
  })
})
