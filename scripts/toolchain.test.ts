import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url))
const webRequire = createRequire(new URL('../web/package.json', import.meta.url))

function installedVersion(packageName: string): string {
  let directory = dirname(webRequire.resolve(packageName))
  const root = parse(directory).root

  while (directory !== root) {
    const packageJsonPath = join(directory, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
        name?: string
        version?: string
      }
      if (packageJson.name === packageName && packageJson.version) return packageJson.version
    }
    directory = dirname(directory)
  }

  throw new Error(`Could not resolve ${packageName} version`)
}

describe('pinned diagnostic toolchain', () => {
  test('keeps TypeScript on the programmatic compiler supported by Astro check', () => {
    expect(installedVersion('typescript')).toBe('6.0.3')
    expect(installedVersion('@astrojs/check')).toBe('0.9.10')
  })

  test('starts the Astro checker successfully', () => {
    const command =
      process.platform === 'win32'
        ? {
            executable: process.env.ComSpec ?? 'cmd.exe',
            arguments: ['/d', '/s', '/c', 'pnpm.cmd --filter @sorouh/web exec astro check --help'],
          }
        : {
            executable: 'pnpm',
            arguments: ['--filter', '@sorouh/web', 'exec', 'astro', 'check', '--help'],
          }

    const result = spawnSync(command.executable, command.arguments, {
      cwd: workspaceRoot,
      encoding: 'utf8',
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    })

    expect(result.status, result.error?.message ?? result.stderr).toBe(0)
    expect(result.stdout).toContain('--minimumFailingSeverity')
  })
})
