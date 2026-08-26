import { describe, expect, test } from 'vitest'
import { buildSeoExpansionPatches } from './build-seo-expansion-patches'

describe('buildSeoExpansionPatches', () => {
  test('adds new service references once and preserves unrelated references', () => {
    const patches = buildSeoExpansionPatches({
      homePage: { _id: 'homePage', featuredServices: [{ _ref: 'service-general-contracting' }] },
      areas: [{ _id: 'area-dammam', featuredServices: [{ _ref: 'service-general-contracting' }] }],
      featuredServiceIds: ['service-roof-insulation', 'service-annex-construction'],
    })

    expect(patches[0]!.set.featuredServices.map((item) => item._ref)).toEqual([
      'service-general-contracting',
      'service-roof-insulation',
      'service-annex-construction',
    ])
    expect(new Set(patches[1]!.set.featuredServices.map((item) => item._ref)).size).toBe(3)
  })

  test('creates stable keys while retaining the current reference order', () => {
    const [homePatch] = buildSeoExpansionPatches({
      homePage: {
        _id: 'homePage',
        featuredServices: [
          { _ref: 'service-existing', _key: 'custom-key' },
          { _ref: 'service-existing' },
        ],
      },
      areas: [],
      featuredServiceIds: ['service-new'],
    })

    expect(homePatch?.set.featuredServices).toEqual([
      { _type: 'reference', _ref: 'service-existing', _key: 'custom-key' },
      { _type: 'reference', _ref: 'service-new', _key: 'service-new' },
    ])
  })
})
