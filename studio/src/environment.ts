import { DATASET } from './constants'

const configuredProjectId = process.env.SANITY_STUDIO_PROJECT_ID
export const dataset = process.env.SANITY_STUDIO_DATASET || DATASET

if (!configuredProjectId || !/^[a-z0-9]+$/.test(configuredProjectId)) {
  throw new Error('SANITY_STUDIO_PROJECT_ID must be a valid Sanity project ID')
}

export const projectId: string = configuredProjectId

if (dataset !== DATASET) {
  throw new Error(`SANITY_STUDIO_DATASET must be ${DATASET}`)
}
