import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://sorouh.site',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
})
