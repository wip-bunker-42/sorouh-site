import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const root = fileURLToPath(new URL('..', import.meta.url))
const read = (path: string) => readFileSync(`${root}/${path}`, 'utf8').replace(/\r\n/g, '\n')

describe('repository automation contracts', () => {
  test('CI validates locked dependencies, the full check, browsers, and Wrangler packaging', () => {
    const workflow = read('.github/workflows/ci.yml')

    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('pnpm install --frozen-lockfile')
    expect(workflow).toContain('pnpm check')
    expect(workflow).toContain('pnpm --dir web exec playwright install --with-deps chromium')
    expect(workflow).not.toContain('\n      - run: pnpm exec playwright install')
    expect(workflow).toContain('pnpm test:e2e')
    expect(workflow).toContain('pnpm --dir web deploy:dry')
    expect(workflow).toContain('pnpm audit --audit-level moderate')
  })

  test('Sanity deployment is main-only, path-aware, serialized, and authenticated by secrets', () => {
    const workflow = read('.github/workflows/deploy-sanity.yml')

    expect(workflow).toContain('branches: [main]')
    expect(workflow).toContain("- 'studio/**'")
    expect(workflow).toContain("- 'pnpm-lock.yaml'")
    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).toContain(
      "if: github.event_name != 'workflow_dispatch' || github.ref == 'refs/heads/main'",
    )
    expect(workflow).toContain('concurrency:')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(workflow).toContain('SANITY_AUTH_TOKEN: ${{ secrets.SANITY_AUTH_TOKEN }}')
    expect(workflow).toContain('SANITY_STUDIO_PROJECT_ID: ${{ secrets.SANITY_STUDIO_PROJECT_ID }}')
    expect(workflow).toContain('SANITY_STUDIO_DATASET: ${{ secrets.SANITY_STUDIO_DATASET }}')
    expect(workflow).toContain('pnpm --dir studio deploy:ci')

    const jobEnvironment = workflow.slice(
      workflow.indexOf('    env:'),
      workflow.indexOf('    steps:'),
    )
    expect(jobEnvironment).not.toContain('SANITY_AUTH_TOKEN')

    const deployStep = workflow.slice(workflow.indexOf('- name: Deploy Studio and schema'))
    expect(deployStep).toContain('SANITY_AUTH_TOKEN: ${{ secrets.SANITY_AUTH_TOKEN }}')
  })

  test('Cloudflare deploys checked main commits and exposes credentials only to the deployment', () => {
    const workflow = read('.github/workflows/deploy-cloudflare.yml')

    expect(workflow).toContain('workflows: [CI]')
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'")
    expect(workflow).toContain("github.event.workflow_run.event == 'push'")
    expect(workflow).toContain("github.event.workflow_run.head_branch == 'main'")
    expect(workflow).toContain(
      'github.event.workflow_run.head_repository.full_name == github.repository',
    )
    expect(workflow).toContain("github.ref == 'refs/heads/main'")
    expect(workflow).toContain('types: [sanity-content-update]')
    expect(workflow).toContain('ref: ${{ needs.source.outputs.sha }}')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(workflow).toContain('persist-credentials: false')
    expect(workflow).toContain('Recheck main immediately before deployment')
    expect(workflow).toContain("if: steps.current.outputs.deploy == 'true'")
    expect(workflow).toContain('pnpm check')
    expect(workflow).toContain('pnpm test:e2e')
    expect(workflow).toContain('pnpm verify:production')
    expect(workflow).not.toContain('pull_request_target')
    expect(workflow).not.toContain('actions/download-artifact')

    const deployIndex = workflow.indexOf('- name: Deploy Worker and static assets')
    expect(workflow.slice(0, deployIndex)).not.toContain('secrets.CLOUDFLARE_')
    const deployStep = workflow.slice(deployIndex, workflow.indexOf('- name: Verify production'))
    expect(deployStep).toContain('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}')
    expect(deployStep).toContain('CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}')
    expect(deployStep).toContain('pnpm --dir web deploy')
  })

  test('Dependabot maintains pnpm and GitHub Actions on a restrained weekly schedule', () => {
    const config = read('.github/dependabot.yml')

    expect(config.match(/package-ecosystem:/g)).toHaveLength(2)
    expect(config).toContain('package-ecosystem: npm')
    expect(config).toContain('package-ecosystem: github-actions')
    expect(config.match(/interval: weekly/g)).toHaveLength(2)
    expect(config).toContain('open-pull-requests-limit: 5')
  })

  test('production monitoring runs on demand and every day without repository write access', () => {
    const workflow = read('.github/workflows/production-check.yml')

    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).toContain("cron: '17 3 * * *'")
    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('pnpm verify:production')
  })

  test('Studio exposes one unattended deploy command that requires schema deployment', () => {
    const packageJson = JSON.parse(read('studio/package.json')) as {
      scripts: Record<string, string>
    }

    expect(packageJson.scripts['deploy:ci']).toBe('sanity deploy --yes --schema-required')
  })

  test('build integration tests create their own production artifacts', () => {
    const packageJson = JSON.parse(read('web/package.json')) as {
      scripts: Record<string, string>
    }

    expect(packageJson.scripts['test:build']).toBe(
      'pnpm build && vitest run tests/integration/build.test.ts',
    )
  })

  test('the Studio package test command executes its real schema tests from the monorepo', () => {
    const command =
      process.platform === 'win32'
        ? {
            executable: process.env.ComSpec ?? 'cmd.exe',
            arguments: ['/d', '/s', '/c', 'pnpm.cmd --filter @sorouh/studio test'],
          }
        : { executable: 'pnpm', arguments: ['--filter', '@sorouh/studio', 'test'] }

    const result = spawnSync(command.executable, command.arguments, {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, CI: 'true' },
    })

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)

    const plainOutput = result.stdout.replace(/\u001b\[[0-9;]*m/g, '')
    expect(plainOutput).toMatch(/Test Files\s+2 passed/)
    expect(plainOutput).toMatch(/Tests\s+27 passed/)
  }, 60_000)

  test('the release checklist records the current automated verification counts', () => {
    const checklist = read('docs/release-checklist.md')

    expect(checklist).toContain('282 unit tests')
    expect(checklist).toContain('8 build tests')
    expect(checklist).toContain('24 browser tests')
    expect(checklist).not.toContain('158 unit tests')
    expect(checklist).not.toContain('128 unit tests')
    expect(checklist).not.toContain('22 browser tests')
    expect(checklist).not.toContain('18 browser tests')
  })
})
