export const EDITORIAL_CONTENT_WAVE_KEYS = [
  'roof-insulation-guide',
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
  'roof-insulation-guide': {
    serviceKeys: ['roof-insulation', 'water-leak-detection'],
    relatedPostKeys: ['water-leak-before-renovation', 'villa-restoration-plan'],
  },
  'water-leak-before-renovation': {
    serviceKeys: ['water-leak-detection', 'home-villa-renovation', 'plumbing'],
    relatedPostKeys: ['roof-insulation-guide', 'villa-restoration-plan', 'mep-before-finishing'],
  },
  'gypsum-board-planning': {
    serviceKeys: ['gypsum-board', 'electrical', 'interior-exterior-painting'],
    relatedPostKeys: ['mep-before-finishing', 'wall-preparation-before-painting'],
  },
  'wall-preparation-before-painting': {
    serviceKeys: ['interior-exterior-painting', 'water-leak-detection', 'home-villa-renovation'],
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
