import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { filterSingletonActions, filterSingletonTemplates } from './src/constants'
import { dataset, projectId } from './src/environment'
import { schemaTypes } from './src/schemaTypes'
import { structure } from './src/structure'

export default defineConfig({
  name: 'sorouh',
  title: 'صروح الشرقية للمقاولات',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (templates) => filterSingletonTemplates(templates),
  },
  document: {
    actions: (actions, context) => filterSingletonActions(actions, context.schemaType),
  },
})
