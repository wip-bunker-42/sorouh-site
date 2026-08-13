import { describe, expect, test } from 'vitest'

import { buildSanityImage, type SanityImageSource } from '../sanity-image'

const image: SanityImageSource = {
  asset: {
    _ref: 'image-0b73330bc26650b029b7807a4e9ac685e-2048x2048-jpg',
  },
  crop: { top: 0.05, bottom: 0.08, left: 0.02, right: 0.03 },
  hotspot: { x: 0.52, y: 0.42, height: 0.72, width: 0.76 },
}

describe('buildSanityImage', () => {
  test('creates responsive auto-format Sanity CDN URLs with intrinsic dimensions', () => {
    const result = buildSanityImage(image, {
      projectId: 'ki7bs4vk',
      dataset: 'production',
      widths: [480, 768, 1280],
      displayWidth: 1280,
      aspectRatio: 16 / 9,
    })

    expect(result.width).toBe(1280)
    expect(result.height).toBe(720)
    expect(result.srcset).toContain(' 480w')
    expect(result.srcset).toContain(' 768w')
    expect(result.srcset).toContain(' 1280w')
    expect(result.src).toContain('auto=format')
    expect(result.src).toContain('fit=crop')
    expect(result.src).not.toContain('fm=avif')
  })

  test('normalizes duplicate and oversized responsive widths', () => {
    const result = buildSanityImage(image, {
      projectId: 'ki7bs4vk',
      dataset: 'production',
      widths: [320, 320, 2200],
      displayWidth: 1600,
    })

    expect(result.srcset.match(/\s\d+w/g)).toHaveLength(2)
    expect(result.srcset).toContain(' 320w')
    expect(result.srcset).toContain(' 1600w')
  })

  test('requires a valid image reference and dimensions', () => {
    expect(() =>
      buildSanityImage({ asset: { _ref: '' } }, {
        projectId: 'ki7bs4vk', dataset: 'production', widths: [480], displayWidth: 800,
      }),
    ).toThrow('Sanity image asset reference is required')

    expect(() =>
      buildSanityImage(image, {
        projectId: 'ki7bs4vk', dataset: 'production', widths: [], displayWidth: 0,
      }),
    ).toThrow('displayWidth')
  })
})
