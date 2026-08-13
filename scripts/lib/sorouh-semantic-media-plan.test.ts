import { describe, expect, test } from 'vitest'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'

import { areas, articles, SERVICE_KEYS, services } from '../../content/sorouh/site-content'
import {
  expectedSemanticMediaTargets,
  sorouhSemanticMediaPlan,
} from '../../content/sorouh/semantic-media-plan'
import { validateSemanticMediaPlan } from './semantic-media'

describe('Sorouh semantic media plan', () => {
  test('covers every public page, service, area, article, and the imageless real project', () => {
    const expected = [
      'homePage',
      'aboutPage',
      ...services.map((service) => `service-${service.key}`),
      ...areas.map((area) => `area-${area.key}`),
      ...articles.map((article) => `post-${article.key}`),
      'project-sorouh-building-plastering-01',
    ].sort()

    expect([...expectedSemanticMediaTargets].sort()).toEqual(expected)
    expect(
      validateSemanticMediaPlan(sorouhSemanticMediaPlan, expectedSemanticMediaTargets),
    ).toEqual({ assets: 20, placements: 31, generated: 12 })
  })

  test('assigns distinct representative media to formerly misleading services', () => {
    const placements = new Map(
      sorouhSemanticMediaPlan.placements.map((placement) => [placement.target, placement.assetKey]),
    )

    expect(placements.get(`service-${SERVICE_KEYS.helicopter}`)).toBe('generated-helicopter-screed')
    expect(placements.get(`service-${SERVICE_KEYS.electrical}`)).toBe('electrical-video-still')
    expect(placements.get(`service-${SERVICE_KEYS.painting}`)).toBe(
      'generated-interior-exterior-painting',
    )
    expect(placements.get('project-sorouh-building-plastering-01')).toBe(
      'building-plastering-video-still',
    )
  })

  test('uses area-focused visuals instead of unrelated trade screenshots', () => {
    const areaPlacements = sorouhSemanticMediaPlan.placements.filter(
      (placement) => placement.role === 'area',
    )

    expect(areaPlacements).toHaveLength(areas.length)
    expect(
      areaPlacements.every((placement) => placement.assetKey.startsWith('generated-area-')),
    ).toBe(true)
  })

  test('keeps seed content media keys aligned with the reviewed placement map', () => {
    const placements = new Map(
      sorouhSemanticMediaPlan.placements.map((placement) => [placement.target, placement.assetKey]),
    )

    for (const service of services) {
      expect(service.mediaKey).toBe(placements.get(`service-${service.key}`))
    }
    for (const area of areas) {
      expect(area.mediaKey).toBe(placements.get(`area-${area.key}`))
    }
    for (const article of articles) {
      expect(article.mediaKey).toBe(placements.get(`post-${article.key}`))
    }
  })

  test('stores every required asset in versioned content paths', async () => {
    for (const asset of sorouhSemanticMediaPlan.assets) {
      expect(asset.path.startsWith('content/sorouh/semantic-media/')).toBe(true)
      await expect(access(resolve(asset.path))).resolves.toBeUndefined()
    }
  })
})
