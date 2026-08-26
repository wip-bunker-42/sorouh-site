import { describe, expect, test } from 'vitest'

import { areas, categories, SERVICE_KEYS, services } from '../../content/sorouh/site-content'

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
})
