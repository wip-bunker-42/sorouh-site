import { describe, expect, test } from 'vitest'

import { SANITY_API_VERSION } from '../constants'

describe('Sanity constants', () => {
  test('uses the reviewed fixed API date', () => {
    expect(SANITY_API_VERSION).toBe('2026-08-13')
  })
})
