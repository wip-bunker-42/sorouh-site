import { createClient } from '@sanity/client'

export const SANITY_API_VERSION = '2026-08-13' as const
export const SANITY_DATASET = 'production' as const

type SanityEnvironment = {
  PUBLIC_SANITY_PROJECT_ID?: string
  PUBLIC_SANITY_DATASET?: string
}

export function createBuildClient(environment: SanityEnvironment = process.env) {
  const projectId = environment.PUBLIC_SANITY_PROJECT_ID
  const dataset = environment.PUBLIC_SANITY_DATASET || SANITY_DATASET

  if (!projectId || !/^[a-z0-9]+$/.test(projectId)) {
    throw new Error('PUBLIC_SANITY_PROJECT_ID is required for a production content build')
  }
  if (dataset !== SANITY_DATASET) {
    throw new Error(`PUBLIC_SANITY_DATASET must be ${SANITY_DATASET}`)
  }

  return createClient({
    projectId,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    perspective: 'published',
  })
}
