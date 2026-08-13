import { pathToFileURL } from 'node:url'

type Runtime = {
  nodeVersion: string
  userAgent?: string
  environment?: Record<string, string | undefined>
}

const MINIMUM_NODE = [22, 12, 0] as const

function parseVersion(version: string): [number, number, number] {
  const match = version.replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)/)

  if (!match) {
    throw new Error(`Unable to read Node.js version: ${version}`)
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function isAtLeastMinimumNode(version: string): boolean {
  const current = parseVersion(version)

  for (let index = 0; index < MINIMUM_NODE.length; index += 1) {
    if (current[index] > MINIMUM_NODE[index]) return true
    if (current[index] < MINIMUM_NODE[index]) return false
  }

  return true
}

export function assertSupportedRuntime({
  nodeVersion,
  userAgent,
  environment = {},
}: Runtime): void {
  if (!isAtLeastMinimumNode(nodeVersion)) {
    throw new Error('Node.js 22.12.0 or newer is required')
  }

  if (!userAgent?.startsWith('pnpm/')) {
    throw new Error('Run project scripts with pnpm')
  }

  const projectId = environment.PUBLIC_SANITY_PROJECT_ID
  if (projectId && !/^[a-z0-9]+$/.test(projectId)) {
    throw new Error('PUBLIC_SANITY_PROJECT_ID is malformed')
  }

  const dataset = environment.PUBLIC_SANITY_DATASET
  if (dataset && !/^[a-z0-9_-]+$/.test(dataset)) {
    throw new Error('PUBLIC_SANITY_DATASET is malformed')
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  assertSupportedRuntime({
    nodeVersion: process.versions.node,
    userAgent: process.env.npm_config_user_agent,
    environment: process.env,
  })

  console.log(
    `Runtime ready: Node.js ${process.versions.node}, ${process.env.npm_config_user_agent}`,
  )
}
