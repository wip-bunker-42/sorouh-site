import { describe, expect, test } from 'vitest'

import {
  CONTENT_COUNTS,
  CONTACT,
  DIRECTION,
  LOCALE,
  RSS_AUTHOR_EMAIL,
  SANITY_API_VERSION,
  SITE_ORIGIN,
} from '../../../../content/sorouh/invariants'

describe('Sorouh immutable project facts', () => {
  test('locks origin, language direction, Sanity API, and RSS identity', () => {
    expect(SITE_ORIGIN).toBe('https://sorouh.site')
    expect(LOCALE).toBe('ar-SA')
    expect(DIRECTION).toBe('rtl')
    expect(SANITY_API_VERSION).toBe('2026-08-13')
    expect(RSS_AUTHOR_EMAIL).toBe('info@sorouh.site')
  })

  test('locks the normalized primary and backup contact numbers', () => {
    expect(CONTACT.primary).toEqual({ local: '0546121683', international: '+966546121683' })
    expect(CONTACT.backup).toEqual({ local: '0546745928', international: '+966546745928' })
  })

  test('locks the approved content inventory', () => {
    expect(CONTENT_COUNTS).toEqual({ services: 13, areas: 10, categories: 5 })
  })
})
