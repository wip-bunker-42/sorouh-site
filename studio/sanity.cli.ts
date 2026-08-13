import { defineCliConfig } from 'sanity/cli'

import { dataset, projectId } from './src/environment'

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: 'sorouh-eastern-contracting',
  deployment: { autoUpdates: false },
})
