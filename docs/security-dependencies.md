# Dependency security maintenance

The October 2026 remediation updates Astro, Sharp, Vitest, Zod, and vulnerable
transitive dependencies through the committed pnpm lockfile and targeted
overrides. The original audit reported 58 advisories: 1 critical, 21 high,
23 moderate, and 13 low. After the available upgrades, the registry reports
only `GHSA-vfj7-8cjw-p6xm` in `braces@3.0.3`.

A fresh audit on 24 October also identified `GHSA-mrhx-c7xc-m3w5` in the
previously pinned Zod release. Both direct dependencies and transitive
Zod 4 dependencies now resolve to the published fixed version `4.6.6`.

## Temporary braces patch

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
describes stack exhaustion in the recursive AST walkers for deeply nested
patterns. On 23 October 2026, the GitHub advisory lists no patched release,
and the npm registry's latest published braces version is `3.0.3`. The
audit endpoint suggests `>=3.0.4`, but that release is not available.

The repository therefore applies `patches/braces@3.0.3.patch` using pnpm's
`patchedDependencies`. It limits actual brace and parentheses nesting to
100 levels while parsing, including unclosed groups, and independently
bounds recursion in compile, expand, and stringify for caller-supplied
ASTs. Rejected input raises a controlled `SyntaxError` before exhausting the
JavaScript stack. Quoted, escaped, and square-bracketed delimiters remain
literal, and sibling groups do not consume the nesting allowance.

The affected paths are Sanity's code generation tools:

- `sanity > @sanity/cli > @sanity/codegen > chokidar > braces`
- `sanity > @sanity/cli > @sanity/codegen > globby > fast-glob > micromatch > braces`

The site deploys static assets. These paths concern dependency/build tooling.
The patch mitigates the reported stack exhaustion; it does not make arbitrary
untrusted glob expansion safe or impose a total expansion-result limit.

`scripts/dependency-security.test.ts` resolves the real installed copy through
the first dependency path. It exercises deep balanced, unbalanced, and mixed
patterns, direct AST inputs, ordinary glob results, and the supported boundary.
Before applying the patch, 24 tests failed, including an observed
`RangeError: Maximum call stack size exceeded`. All 28 tests pass with the patch.
The tests run in the regular `pnpm test` and `pnpm check` commands.

## Audit exception and removal

The registry audit identifies packages by upstream name and version and cannot
recognize a local patch. `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`
therefore excludes **only `GHSA-vfj7-8cjw-p6xm`**, whose mitigation is verified
above. All other advisories and the CI moderate-severity gate remain enabled.
GitHub dependency alerts may still identify the original upstream package;
this document and the patch provide the evidence for a mitigation assessment.

Verification commands:

```powershell
pnpm install --frozen-lockfile
pnpm exec vitest run scripts/dependency-security.test.ts
pnpm audit --audit-level moderate
pnpm check
```

The remediation session retained unfiltered registry reports in the ignored
`work/` directory: `audit-before.json`, `audit-after-upgrades.json`, and
`audit-after-patch-raw.json`. The last report still contains the one upstream
braces advisory, with zero other severities. To inspect a fresh unfiltered
report, temporarily remove only the `auditConfig.ignoreGhsas` entry, run
`pnpm audit --json`, and restore the entry without changing the lockfile.

When a patched upstream braces release becomes available, update the dependency
resolution, remove both the local patch registration/file and this single
advisory exception, run the regression tests, and rerun the full check and audit.
Keep the regression tests until the replacement has equivalent protections.

## Existing Sanity maintenance warning

The pinned `sanity@6.12.0` release has an npm deprecation warning about a
Portable Text data-loss bug fixed in `6.14.1`. That issue is separate from
the vulnerability audit. A trial of the newer release selected transitive
packages requiring newer Sanity and React versions, so this security change
keeps the existing validated Sanity/React toolchain. A coordinated Sanity
upgrade and editor validation remain maintenance work; the deprecation is
not suppressed by the advisory exception above.
