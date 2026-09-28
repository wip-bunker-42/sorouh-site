import { describe, expect, test } from 'vitest'

import {
  areas,
  articles,
  categories,
  SERVICE_KEYS,
  services,
} from '../../content/sorouh/site-content'

describe('Sorouh content inventory', () => {
  test('keeps every service key unique and represented by one service', () => {
    const keys = Object.values(SERVICE_KEYS)
    expect(new Set(keys).size).toBe(keys.length)
    expect(new Set(services.map((service) => service.key))).toEqual(new Set(keys))
  })

  test('preserves the approved geographic and category baseline without fixing service growth', () => {
    expect(areas.length).toBeGreaterThanOrEqual(10)
    expect(categories.length).toBeGreaterThanOrEqual(5)
    expect(services.length).toBeGreaterThanOrEqual(13)
  })

  test('includes every newly confirmed service with complete commercial content', () => {
    const required = ['annex-construction', 'demolition-removal']
    for (const key of required) {
      const service = services.find((item) => item.key === key)
      expect(service, key).toBeDefined()
      expect(service!.summary.length).toBeGreaterThan(50)
      expect(service!.directAnswer.length).toBeGreaterThan(80)
      expect(service!.deliverables.length).toBeGreaterThanOrEqual(4)
      expect(service!.process.length).toBeGreaterThanOrEqual(4)
      expect(service!.quality.length).toBeGreaterThanOrEqual(3)
      expect(service!.faqs.length).toBeGreaterThanOrEqual(3)
    }
  })

  test('adds only the approved decision guides with related services', () => {
    const required = [
      'water-leak-before-renovation',
      'gypsum-board-planning',
      'wall-preparation-before-painting',
      'annex-construction-checklist',
    ]
    for (const key of required) {
      const article = articles.find((item) => item.key === key)
      expect(article, key).toBeDefined()
      expect(article!.excerpt.length).toBeGreaterThanOrEqual(70)
      expect(article!.markdown).toContain('[[CTA]]')
    }
  })
})
