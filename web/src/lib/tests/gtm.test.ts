import { describe, expect, test } from 'vitest'
import { parseGtmId } from '../analytics/gtm'
describe('parseGtmId', () => {
  test('disables blank values', () => {
    expect(parseGtmId(undefined)).toBeNull()
    expect(parseGtmId('')).toBeNull()
  })
  test('accepts GTM containers', () => expect(parseGtmId('GTM-ABCDEFG')).toBe('GTM-ABCDEFG'))
  test.each(['G-ABC', 'AW-123', ' GTM-ABC', 'GTM-A B', 'GTM-ABC<script>'])('rejects %s', (value) =>
    expect(() => parseGtmId(value)).toThrow('PUBLIC_GTM_ID'),
  )
})
