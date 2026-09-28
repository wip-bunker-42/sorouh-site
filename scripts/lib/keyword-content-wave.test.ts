import { describe, expect, test } from 'vitest'

import {
  keywordContentWave,
  validateKeywordContentWave,
} from '../../content/sorouh/seo/keyword-content-wave'

describe('keyword content wave', () => {
  test('contains exactly the approved new local landing pages', () => {
    expect(keywordContentWave.map((entry) => entry.key).sort()).toEqual(
      [
        'building-contractor-dammam',
        'demolition-dammam',
        'electrical-dammam',
        'gypsum-dammam',
        'painter-ahsa',
        'painter-jubail',
        'painter-khobar',
        'painter-qatif',
        'plumbing-dammam',
        'plumbing-khobar',
      ].sort(),
    )
  })

  test('keeps each page locally distinct and complete', () => {
    expect(new Set(keywordContentWave.map((entry) => entry.summary)).size).toBe(
      keywordContentWave.length,
    )
    expect(new Set(keywordContentWave.map((entry) => entry.localAngle)).size).toBe(
      keywordContentWave.length,
    )
    for (const entry of keywordContentWave) {
      expect(entry.deliverables.length).toBeGreaterThanOrEqual(4)
      expect(entry.process.length).toBeGreaterThanOrEqual(4)
      expect(entry.faqs.length).toBeGreaterThanOrEqual(3)
    }
  })

  test('rejects recreating an existing landing key', () => {
    expect(() =>
      validateKeywordContentWave(keywordContentWave, new Set(['painter-khobar'])),
    ).toThrow('Existing landing must be improved, not recreated: painter-khobar')
  })

  test('rejects a duplicate service and area relation', () => {
    const buildingEntry = keywordContentWave.find(
      (entry) => entry.key === 'building-contractor-dammam',
    )
    if (!buildingEntry) throw new Error('Missing building contractor fixture')

    expect(() =>
      validateKeywordContentWave(
        [buildingEntry, { ...buildingEntry, key: 'duplicate-key' }],
        new Set(),
      ),
    ).toThrow('Duplicate service-area relation: building-contractor:dammam')
  })
})
