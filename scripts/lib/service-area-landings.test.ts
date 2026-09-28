import { describe, expect, test } from 'vitest'
import { serviceAreaLandings } from '../../content/sorouh/service-area-landings'

describe('approved service-area landing content', () => {
  test('contains only the first reviewed opportunities', () => {
    expect(serviceAreaLandings.map((item) => item.key).sort()).toEqual([
      'annex-dammam',
      'painter-dammam',
      'renovation-dammam',
      'renovation-khobar',
    ])
  })

  test('keeps existing owner keys stable for improvement instead of recreation', () => {
    const existingKeys = new Set(serviceAreaLandings.map((item) => item.key))
    for (const key of [
      'renovation-dammam',
      'renovation-khobar',
      'painter-dammam',
      'annex-dammam',
    ]) {
      expect(existingKeys).toContain(key)
    }
  })

  test('keeps each local angle and summary unique', () => {
    expect(new Set(serviceAreaLandings.map((item) => item.summary)).size).toBe(
      serviceAreaLandings.length,
    )
    expect(new Set(serviceAreaLandings.map((item) => item.localAngle)).size).toBe(
      serviceAreaLandings.length,
    )
    for (const item of serviceAreaLandings) {
      expect(item.deliverables.length).toBeGreaterThanOrEqual(4)
      expect(item.process.length).toBeGreaterThanOrEqual(3)
      expect(item.faqs.length).toBeGreaterThanOrEqual(3)
    }
  })
})
