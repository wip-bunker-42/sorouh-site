import { defineCliConfig } from 'sanity/cli'

import { dataset, projectId } from './src/environment'

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: 'sorouh-studio',
  deployment: { appId: 'xlmvcxav90v4bm3von2nosay', autoUpdates: false },
  typegen: {
    enabled: true,
    path: '../web/src/sanity/queries.ts',
    schema: '../web/src/sanity/schema.json',
    generates: '../web/src/sanity/sanity.types.ts',
    overloadClientMethods: true,
  },
})
