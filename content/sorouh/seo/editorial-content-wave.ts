export const EDITORIAL_CONTENT_WAVE_KEYS = [
  'water-leak-before-renovation',
  'gypsum-board-planning',
  'wall-preparation-before-painting',
  'annex-construction-checklist',
] as const

export type EditorialArticleRelation = {
  serviceKeys: string[]
  relatedPostKeys: string[]
}

export const EDITORIAL_ARTICLE_RELATIONS = {
  'water-leak-before-renovation': {
    serviceKeys: ['home-villa-renovation', 'plumbing'],
    relatedPostKeys: ['villa-restoration-plan', 'mep-before-finishing'],
  },
  'gypsum-board-planning': {
    serviceKeys: ['gypsum-board', 'electrical', 'interior-exterior-painting'],
    relatedPostKeys: ['mep-before-finishing', 'wall-preparation-before-painting'],
  },
  'wall-preparation-before-painting': {
    serviceKeys: ['interior-exterior-painting', 'home-villa-renovation'],
    relatedPostKeys: [
      'water-leak-before-renovation',
      'gypsum-board-planning',
      'villa-restoration-plan',
    ],
  },
  'annex-construction-checklist': {
    serviceKeys: ['annex-construction', 'building-contractor', 'electrical', 'plumbing'],
    relatedPostKeys: ['choose-contractor', 'mep-before-finishing'],
  },
} satisfies Record<(typeof EDITORIAL_CONTENT_WAVE_KEYS)[number], EditorialArticleRelation>
