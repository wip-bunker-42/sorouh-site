import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, test } from 'vitest'

import { normalizeSnapshot } from '../content/normalize'
import { validateRawSnapshot } from '../content/validate'
import { createBuildClient } from '../../sanity/client'

type MutableSnapshot = Record<string, any>
const fixturePath = fileURLToPath(
  new URL('../../../tests/fixtures/site-snapshot.json', import.meta.url),
)
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as MutableSnapshot

let raw: MutableSnapshot

beforeEach(() => {
  raw = structuredClone(fixture)
})

describe('published content snapshot', () => {
  test('requires production Sanity environment when no fixture is selected', () => {
    expect(() => createBuildClient({})).toThrow(
      'PUBLIC_SANITY_PROJECT_ID is required for a production content build',
    )
  })

  test('locks the production client to the reviewed static-build configuration', () => {
    const config = createBuildClient({
      PUBLIC_SANITY_PROJECT_ID: 'ki7bs4vk',
      PUBLIC_SANITY_DATASET: 'production',
    }).config()

    expect(config).toMatchObject({
      projectId: 'ki7bs4vk',
      dataset: 'production',
      apiVersion: '2026-08-13',
      useCdn: false,
      perspective: 'published',
    })
  })

  test('excludes drafts and retains noIndex for discovery filtering', () => {
    raw.services.push({ ...raw.services[0], _id: 'drafts.fixture-service-copy' })
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
    expect(snapshot.services).toHaveLength(1)
    expect(snapshot.services[0]!.seo.noIndex).toBe(true)
  })

  test('fails when a required singleton is missing', () => {
    delete raw.homePage
    expect(() => validateRawSnapshot(raw)).toThrow('Missing singleton: homePage')
  })

  test('fails on duplicate slugs within the same route collection', () => {
    raw.services.push({ ...raw.services[0], _id: 'other-service' })
    expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
      'Duplicate service slug: مقاولات-عامة',
    )
  })

  test('warns for missing optional related references', () => {
    raw.posts[0].relatedPosts = [{ _id: 'missing-related-post' }]
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
    expect(snapshot.warnings).toContain(
      'post fixture-post references missing optional post missing-related-post',
    )
  })

  test('fails when a required project reference is absent', () => {
    raw.projects[0].services = []
    expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
      'Project fixture-project-001 is incomplete: services',
    )
  })

  test('names the exact project source key and every incomplete field', () => {
    delete raw.projects[0].title
    delete raw.projects[0].result
    raw.projects[0].gallery = []
    raw.projects[0].videos = []
    expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
      'Project fixture-project-001 is incomplete: title, result, media',
    )
  })

  test('omits aggregate lastmod because collection pages change for many reasons', () => {
    const snapshot = normalizeSnapshot(validateRawSnapshot(raw))
    expect(snapshot.aggregateLastmod).toEqual({})
  })
})
