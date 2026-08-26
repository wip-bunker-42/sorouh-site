import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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

test('contact events include page path and no phone value', () => {
  const source = readFileSync(
    fileURLToPath(new URL('../../../public/contact-events.js', import.meta.url)),
    'utf8',
  )
  expect(source).toContain("event: 'contact_click'")
  expect(source).toContain('page_path: window.location.pathname')
  expect(source).not.toMatch(/phone|href:/)
})
