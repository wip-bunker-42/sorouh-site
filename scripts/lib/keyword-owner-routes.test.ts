import { expect, test } from 'vitest'

import { getServiceAreaRoutes } from './keyword-owner-routes'

test('builds canonical routes for approved service-area content', () => {
  const routes = getServiceAreaRoutes(
    [
      { key: 'plumbing', slug: 'اعمال-السباكة' },
      { key: 'painting', slug: 'دهانات-داخلية-وخارجية' },
    ],
    [
      { key: 'dammam', slug: 'الدمام' },
      { key: 'khobar', slug: 'الخبر' },
    ],
    [
      { key: 'plumbing-dammam', serviceKey: 'plumbing', areaKey: 'dammam' },
      { key: 'painter-khobar', serviceKey: 'painting', areaKey: 'khobar' },
    ],
  )

  expect(routes).toEqual(
    new Set([
      '/الخدمات/اعمال-السباكة/الدمام/',
      '/الخدمات/دهانات-داخلية-وخارجية/الخبر/',
    ]),
  )
})

test('rejects content that refers to an unknown service or area', () => {
  expect(() =>
    getServiceAreaRoutes(
      [{ key: 'plumbing', slug: 'اعمال-السباكة' }],
      [{ key: 'dammam', slug: 'الدمام' }],
      [{ key: 'unknown', serviceKey: 'unknown', areaKey: 'dammam' }],
    ),
  ).toThrow('Unknown local landing relation: unknown')
})
