import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const source = readFileSync(fileURLToPath(new URL('./seed-sorouh.ts', import.meta.url)), 'utf8')

describe('Sorouh seed safety', () => {
  test('loads site-settings media only when site settings need creation', () => {
    const siteSettingsGuard = source.indexOf("if (!existingIds.has('siteSettings')) {")
    const logoLoad = source.indexOf("const logo = await contentImage('brand-logo-source'")
    expect(siteSettingsGuard).toBeGreaterThan(-1)
    expect(logoLoad).toBeGreaterThan(siteSettingsGuard)
  })
})
