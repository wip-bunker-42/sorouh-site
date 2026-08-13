import { describe, expect, test } from 'vitest'

import { assertSupportedRuntime } from './preflight'

describe('assertSupportedRuntime', () => {
  test('accepts the pinned Node and pnpm runtime', () => {
    expect(() =>
      assertSupportedRuntime({
        nodeVersion: '24.16.0',
        userAgent: 'pnpm/11.11.0 npm/? node/v24.16.0',
      }),
    ).not.toThrow()
  })

  test('rejects Node versions older than 22.12.0', () => {
    expect(() =>
      assertSupportedRuntime({
        nodeVersion: '22.11.0',
        userAgent: 'pnpm/11.11.0 npm/? node/v22.11.0',
      }),
    ).toThrow('Node.js 22.12.0 or newer is required')
  })

  test('rejects execution through a package manager other than pnpm', () => {
    expect(() =>
      assertSupportedRuntime({ nodeVersion: '24.16.0', userAgent: 'npm/11.17.0 node/v24.16.0' }),
    ).toThrow('Run project scripts with pnpm')
  })

  test('rejects malformed Sanity environment values when they are supplied', () => {
    expect(() =>
      assertSupportedRuntime({
        nodeVersion: '24.16.0',
        userAgent: 'pnpm/11.11.0 npm/? node/v24.16.0',
        environment: {
          PUBLIC_SANITY_PROJECT_ID: 'Project ID!',
          PUBLIC_SANITY_DATASET: 'production',
        },
      }),
    ).toThrow('PUBLIC_SANITY_PROJECT_ID is malformed')
  })
})
