import { describe, expect, test } from 'vitest'

import { validateKeywordTargets, type KeywordTarget } from './seo-keyword-targets'

const livePaths = new Set(['/الخدمات/ترميم-منازل-وفلل/', '/مناطق-الخدمة/الدمام/'])

const target = (overrides: Partial<KeywordTarget> = {}): KeywordTarget => ({
  id: 'renovation-dammam',
  primaryKeyword: 'مقاول ترميم الدمام',
  variants: ['ترميم الدمام'],
  intent: 'transactional',
  geography: 'الدمام',
  status: 'active',
  ownerPath: '/مناطق-الخدمة/الدمام/',
  source: 'google-ads-api-v25',
  researchedAt: '2026-08-26',
  avgMonthlySearches: 1600,
  ...overrides,
})

describe('SEO keyword targets', () => {
  test('accepts one live owner for every active target', () => {
    expect(validateKeywordTargets([target()], livePaths)).toEqual({ active: 1, candidates: 0 })
  })

  test('rejects a normalized keyword owned by two active targets', () => {
    expect(() =>
      validateKeywordTargets(
        [target(), target({ id: 'duplicate', primaryKeyword: ' ترميم   الدمام ' })],
        livePaths,
      ),
    ).toThrow('Keyword collision: ترميم الدمام')
  })

  test('rejects an active owner that is not a live route', () => {
    expect(() =>
      validateKeywordTargets([target({ ownerPath: '/الخدمات/غير-موجود/' })], livePaths),
    ).toThrow('Active target renovation-dammam owns missing route')
  })

  test('allows a researched candidate without an owner route', () => {
    expect(
      validateKeywordTargets([target({ status: 'candidate', ownerPath: undefined })], livePaths),
    ).toEqual({ active: 0, candidates: 1 })
  })
})
