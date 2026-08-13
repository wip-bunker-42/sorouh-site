import { defineCliConfig } from 'sanity/cli'

import { dataset, projectId } from './src/environment'

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: 'sorouh-eastern-contracting',
  deployment: { autoUpdates: false },
  typegen: {
    enabled: true,
    path: '../web/src/sanity/queries.ts',
    schema: '../web/src/sanity/schema.json',
    generates: '../web/src/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
})
