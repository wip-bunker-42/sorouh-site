import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/*.test.ts', 'studio/src/**/*.test.ts', 'web/src/**/*.test.ts'],
  },
})
