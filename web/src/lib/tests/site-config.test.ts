import { describe, expect, test } from 'vitest'

import { normalizeSiteOrigin } from '../../config/site'

describe('site origin configuration', () => {
  test('accepts one HTTPS origin and removes the trailing slash', () => {
    expect(normalizeSiteOrigin('https://example.sa/')).toBe('https://example.sa')
  })

  test.each(['http://example.sa', 'https://example.sa/path', 'not-a-url'])(
    'rejects a non-canonical origin: %s',
    (value) => expect(() => normalizeSiteOrigin(value)).toThrow('PUBLIC_SITE_ORIGIN'),
  )
})
