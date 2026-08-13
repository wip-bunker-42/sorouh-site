import { describe, expect, test } from 'vitest'

import { canonicalUrl } from '../url'

describe('canonicalUrl', () => {
  test.each([
    ['/', 'https://sorouh.site/'],
    ['/الخدمات', 'https://sorouh.site/%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA/'],
    [
      '/الخدمات//مقاولات-عامة',
      'https://sorouh.site/%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA/%D9%85%D9%82%D8%A7%D9%88%D9%84%D8%A7%D8%AA-%D8%B9%D8%A7%D9%85%D8%A9/',
    ],
    ['/rss.xml', 'https://sorouh.site/rss.xml'],
    ['/assets/logo.webp', 'https://sorouh.site/assets/logo.webp'],
  ])('canonicalizes %s', (path, expected) => {
    expect(canonicalUrl(path).href).toBe(expected)
  })

  test('accepts a same-origin HTTPS override', () => {
    expect(canonicalUrl('/الخدمات/', 'https://sorouh.site/خدمة-مميزة/').pathname).toBe(
      '/%D8%AE%D8%AF%D9%85%D8%A9-%D9%85%D9%85%D9%8A%D8%B2%D8%A9/',
    )
  })

  test('rejects a foreign override unless a technical caller explicitly allows it', () => {
    expect(() => canonicalUrl('/', 'https://example.com/')).toThrow('Foreign canonical override')
    expect(canonicalUrl('/', 'https://example.com/', { allowForeignOverride: true }).href).toBe(
      'https://example.com/',
    )
  })

  test.each(['/x/?a=1', '/x/#part', 'https://evil.example/x'])(
    'rejects unsafe route input %s',
    (path) => expect(() => canonicalUrl(path)).toThrow('Unsafe canonical path'),
  )
})
