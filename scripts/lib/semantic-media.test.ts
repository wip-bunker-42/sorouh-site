import { describe, expect, test } from 'vitest'

import { validateSemanticMediaPlan, type SemanticMediaPlan } from './semantic-media'

const validPlan: SemanticMediaPlan = {
  assets: [
    {
      key: 'generated-electrical',
      origin: 'generated',
      path: 'content/sorouh/generated-media/electrical.webp',
      topics: ['electrical'],
    },
    {
      key: 'client-plumbing',
      origin: 'source',
      path: 'work/source-media/sorouh/plumbing.jpeg',
      topics: ['plumbing'],
    },
  ],
  placements: [
    {
      target: 'service-electrical',
      role: 'service',
      assetKey: 'generated-electrical',
      topic: 'electrical',
      alt: 'فني ينفذ تأسيس الكهرباء داخل فيلا سكنية',
    },
    {
      target: 'project-plumbing',
      role: 'project',
      assetKey: 'client-plumbing',
      topic: 'plumbing',
      alt: 'شبكة صرف وتغذية منفذة داخل مشروع فيلا',
    },
  ],
}

describe('validateSemanticMediaPlan', () => {
  test('accepts complete placements whose assets match their page topics', () => {
    expect(
      validateSemanticMediaPlan(validPlan, ['service-electrical', 'project-plumbing']),
    ).toEqual({ assets: 2, placements: 2, generated: 1 })
  })

  test('rejects a semantically unrelated image placement', () => {
    expect(() =>
      validateSemanticMediaPlan(
        {
          ...validPlan,
          placements: [
            { ...validPlan.placements[0]!, topic: 'painting' },
            validPlan.placements[1]!,
          ],
        },
        ['service-electrical', 'project-plumbing'],
      ),
    ).toThrow('generated-electrical does not cover topic painting')
  })

  test('never presents a generated illustration as project evidence', () => {
    expect(() =>
      validateSemanticMediaPlan(
        {
          ...validPlan,
          placements: [
            validPlan.placements[0]!,
            {
              target: 'project-generated',
              role: 'project',
              assetKey: 'generated-electrical',
              topic: 'electrical',
              alt: 'صورة مشروع كهرباء',
            },
          ],
        },
        ['service-electrical', 'project-generated'],
      ),
    ).toThrow('Generated media cannot be used as project evidence: project-generated')
  })

  test('rejects generic illustrative labels from visitor-facing captions', () => {
    expect(() =>
      validateSemanticMediaPlan(
        {
          ...validPlan,
          placements: [
            { ...validPlan.placements[0]!, caption: 'صورة توضيحية لخدمة أعمال الكهرباء' },
            validPlan.placements[1]!,
          ],
        },
        ['service-electrical', 'project-plumbing'],
      ),
    ).toThrow('Generic illustrative captions are not visitor-facing content: service-electrical')
  })

  test('rejects missing, duplicate, and unknown public image targets', () => {
    expect(() =>
      validateSemanticMediaPlan(validPlan, ['service-electrical', 'project-plumbing', 'homePage']),
    ).toThrow('Missing media placement: homePage')

    expect(() =>
      validateSemanticMediaPlan(
        {
          ...validPlan,
          placements: [...validPlan.placements, validPlan.placements[0]!],
        },
        ['service-electrical', 'project-plumbing'],
      ),
    ).toThrow('Duplicate media placement: service-electrical')

    expect(() => validateSemanticMediaPlan(validPlan, ['service-electrical'])).toThrow(
      'Unknown media placement: project-plumbing',
    )
  })
})
