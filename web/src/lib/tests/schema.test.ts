import { describe, expect, test } from 'vitest'

import { buildBaseSchema, buildServiceSchema } from '../seo/schema'

const context = {
  origin: 'https://sorouh.site',
  canonical: 'https://sorouh.site/الخدمات/مقاولات-عامة/',
  title: 'مقاولات عامة في المنطقة الشرقية | صروح الشرقية',
  description: 'تنفيذ وإدارة أعمال المقاولات في المنطقة الشرقية.',
  companyName: 'شركة صروح الشرقية للمقاولات',
  phones: ['+966546121683', '+966546745928'],
  areas: ['الدمام', 'الخبر'],
  breadcrumbs: [{ label: 'الخدمات', href: '/الخدمات/' }, { label: 'مقاولات عامة' }],
}

describe('SEO schema graph', () => {
  test('uses stable IDs and connects page, site, and contractor', () => {
    const graph = buildBaseSchema(context)
    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'WebSite', '@id': 'https://sorouh.site/#website' }),
        expect.objectContaining({
          '@type': 'GeneralContractor',
          '@id': 'https://sorouh.site/#organization',
        }),
        expect.objectContaining({
          '@type': 'WebPage',
          isPartOf: { '@id': 'https://sorouh.site/#website' },
          about: { '@id': 'https://sorouh.site/#organization' },
        }),
      ]),
    )
  })

  test('builds a service owned by the contractor and served in named places', () => {
    expect(
      buildServiceSchema({
        origin: context.origin,
        path: '/الخدمات/مقاولات-عامة/',
        name: 'مقاولات عامة',
        description: context.description,
        areas: context.areas,
      }),
    ).toMatchObject({
      '@type': 'Service',
      provider: { '@id': 'https://sorouh.site/#organization' },
      areaServed: [
        { '@type': 'City', name: 'الدمام' },
        { '@type': 'City', name: 'الخبر' },
      ],
    })
  })
})
