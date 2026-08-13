import { describe, expect, test } from 'vitest'

import { generateRedirects } from '../redirects'

const liveRoutes = new Set(['/الخدمات/جديد/', '/مشاريعنا/مشروع/', '/اتصل-بنا/'])

describe('generateRedirects', () => {
  test('normalizes internal redirects and emits Cloudflare 301 lines', () => {
    expect(
      generateRedirects(
        [{ source: '/الخدمات/قديم', destination: '/الخدمات/جديد/', status: 301 }],
        liveRoutes,
      ),
    ).toBe('/الخدمات/قديم/ /الخدمات/جديد/ 301\n')
  })

  test.each([
    [[{ source: '/قديم/', destination: '/قديم/' }], 'self redirect'],
    [[{ source: 'https://evil.example/x', destination: '/اتصل-بنا/' }], 'internal path'],
    [[{ source: '/قديم/?x=1', destination: '/اتصل-بنا/' }], 'query or fragment'],
    [[{ source: '/قديم/', destination: 'https://evil.example/x' }], 'internal path'],
    [[{ source: '/اتصل-بنا/', destination: '/الخدمات/جديد/' }], 'collides with live route'],
    [[{ source: '/قديم/', destination: '/مفقود/' }], 'missing live destination'],
  ] as const)('rejects invalid redirect: %s', (records, message) => {
    expect(() => generateRedirects([...records], liveRoutes)).toThrow(message)
  })

  test('rejects duplicate sources', () => {
    expect(() =>
      generateRedirects(
        [
          { source: '/قديم/', destination: '/الخدمات/جديد/' },
          { source: '/قديم', destination: '/اتصل-بنا/' },
        ],
        liveRoutes,
      ),
    ).toThrow('duplicate redirect source')
  })

  test('rejects cycles even when intermediate destinations are redirects', () => {
    expect(() =>
      generateRedirects(
        [
          { source: '/قديم-أ/', destination: '/قديم-ب/' },
          { source: '/قديم-ب/', destination: '/قديم-أ/' },
        ],
        liveRoutes,
      ),
    ).toThrow('redirect cycle')
  })
})
