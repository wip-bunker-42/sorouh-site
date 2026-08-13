import { defineConfig } from 'astro/config'
import { SITE_ORIGIN } from './src/config/site'

export default defineConfig({
  site: SITE_ORIGIN,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
})
