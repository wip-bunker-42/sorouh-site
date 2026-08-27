# Keyword Content Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish and measure high-intent Arabic service content for Sorouh without duplicate keyword ownership or city-template pages.

**Architecture:** The checked Keyword Planner research becomes a typed ownership registry and a reviewed content-wave source. A safe Sanity upsert script creates only new approved local landing documents and improves designated existing owner documents by stable ID. The Astro snapshot then regenerates route, sitemap, canonical, schema, and internal-link outputs from Sanity; Cloudflare receives only a verified static build.

**Tech Stack:** TypeScript, Vitest, Sanity 6, Astro 7 SSG, Google Ads API research evidence, Wrangler 4.

**Spec:** `docs/superpowers/specs/2026-08-26-keyword-research-content-architecture-design.md`

## Global Constraints

- Keep each normalized keyword and its close commercial variants owned by one active URL only.
- Improve an existing owner rather than create a comparable service/city URL.
- New local pages require unique summary, local angle, deliverables, process, FAQ set, and internal-link context.
- Publish only the verified first wave: Dammam, Khobar, Al Ahsa, Jubail, and Qatif phrases that have measured demand and an existing supported service.
- Never create claims for prices, guarantees, certifications, project counts, years of experience, or availability that lack evidence.
- Run API content mutations first in dry-run mode; abort unless project is `ki7bs4vk` and dataset is `production`.
- Do not place Google Ads credentials, tokens, raw API responses, or customer IDs in the repository.

---

### Task 1: Establish the research-backed ownership registry

**Files:**
- Create: `content/sorouh/seo/keyword-research.ts`
- Modify: `content/sorouh/seo/keyword-targets.ts`
- Modify: `scripts/lib/seo-keyword-targets.ts`
- Test: `scripts/lib/seo-keyword-targets.test.ts`
- Test: `scripts/validate-seo-keyword-targets.ts`

**Interfaces:**
- Consumes: `KeywordTarget` from `scripts/lib/seo-keyword-targets.ts` and the confirmed demand tables in the spec.
- Produces: `KEYWORD_RESEARCH_SUMMARY` (non-secret metadata and selected metrics) and `SEO_KEYWORD_TARGETS` with one `ownerPath` for each active target.

- [ ] **Step 1: Add failing ownership-registry tests**

Extend `scripts/lib/seo-keyword-targets.test.ts` with explicit expected behavior:

```ts
test('rejects two active targets that own the same service and area relation', () => {
  const ownerPath = '/الخدمات/اعمال-السباكة/الدمام/'
  expect(() =>
    validateKeywordTargets(
      [
        target({ id: 'plumber-dammam', primaryKeyword: 'سباك الدمام', ownerPath }),
        target({ id: 'plumber-dammam-copy', primaryKeyword: 'سباك بالدمام', ownerPath }),
      ],
      new Set([ownerPath]),
    ),
  ).toThrow('Duplicate owner path: /الخدمات/اعمال-السباكة/الدمام/')
})

test('allows a non-active keyword variant to remain monitored without an owner path', () => {
  expect(
    validateKeywordTargets(
      [target({ status: 'monitor', ownerPath: undefined, primaryKeyword: 'قص خرسانة الدمام' })],
      new Set(),
    ),
  ).toEqual({ active: 0, candidates: 0 })
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `pnpm exec vitest run scripts/lib/seo-keyword-targets.test.ts`

Expected: failure because duplicate owner paths are currently accepted and the new research registry does not exist.

- [ ] **Step 3: Add a typed non-secret research summary**

Create `content/sorouh/seo/keyword-research.ts` with the research date, language, geographic scope, scan counts, source description, and only selected phrase/volume/competition values from the approved spec. Do not include OAuth, developer-token, customer, or raw-response data.

Use this shape:

```ts
export type KeywordResearchFinding = {
  phrase: string
  geography: string
  avgMonthlySearches: number
  competition: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNSPECIFIED'
  disposition: 'active' | 'candidate' | 'monitor' | 'exclude'
  rationale: string
}

export const KEYWORD_RESEARCH_SUMMARY = {
  researchedAt: '2026-08-26',
  source: 'Google Ads Keyword Planner API',
  language: 'Arabic',
  geographicScope: 'Eastern Province, Saudi Arabia',
  scannedServiceCityPhrases: 126,
  phrasesWithMeasuredDemand: 49,
} as const
```

- [ ] **Step 4: Make duplicate owner paths invalid and populate the first-wave targets**

In `validateKeywordTargets`, track active `ownerPath` values in a `Map<string, string>` and throw `Duplicate owner path: <path>` when two IDs use the same owner URL. Keep exact normalized-keyword collision protection.

Update `SEO_KEYWORD_TARGETS` so its active rows map to exactly one of these first-wave owner URLs:

```text
/الخدمات/دهانات-داخلية-وخارجية/الدمام/
/الخدمات/عزل-الاسطح/الدمام/
/الخدمات/ترميم-منازل-وفلل/الدمام/
/الخدمات/اعمال-السباكة/الدمام/
/الخدمات/اعمال-الكهرباء/الدمام/
/الخدمات/جبس-بورد/الدمام/
/الخدمات/مقاول-بناء/الدمام/
/الخدمات/الهدم-والازالة/الدمام/
/الخدمات/دهانات-داخلية-وخارجية/الخبر/
/الخدمات/ترميم-منازل-وفلل/الخبر/
/الخدمات/اعمال-السباكة/الخبر/
/الخدمات/دهانات-داخلية-وخارجية/الاحساء/
/الخدمات/دهانات-داخلية-وخارجية/الجبيل/
/الخدمات/دهانات-داخلية-وخارجية/القطيف/
```

Keep second-wave and zero-demand city combinations as `candidate` or `monitor`, never `active`.

- [ ] **Step 5: Run the ownership checks**

Run:

```bash
pnpm exec vitest run scripts/lib/seo-keyword-targets.test.ts
pnpm seo:validate-targets
```

Expected: focused tests pass and the CLI reports valid active/candidate targets with no missing route or keyword/owner collision.

- [ ] **Step 6: Commit the registry**

```bash
git add content/sorouh/seo/keyword-research.ts content/sorouh/seo/keyword-targets.ts scripts/lib/seo-keyword-targets.ts scripts/lib/seo-keyword-targets.test.ts scripts/validate-seo-keyword-targets.ts
git commit -m "feat: record keyword ownership research"
```

### Task 2: Define unique first-wave service-and-city content

**Files:**
- Modify: `content/sorouh/service-area-landings.ts`
- Create: `content/sorouh/seo/keyword-content-wave.ts`
- Test: `scripts/lib/service-area-landings.test.ts`
- Create: `scripts/lib/keyword-content-wave.test.ts`

**Interfaces:**
- Consumes: `SERVICE_KEYS`, supported `areas`, existing `serviceAreaLandings`, and first-wave keyword target IDs.
- Produces: `keywordContentWave` records with `key`, `title`, `serviceKey`, `areaKey`, `summary`, `localAngle`, `deliverables`, `process`, `faqs`, and `mode: 'create' | 'improve'`.

- [ ] **Step 1: Add failing first-wave content tests**

Create `scripts/lib/keyword-content-wave.test.ts` with required keys and uniqueness checks:

```ts
expect(keywordContentWave.map((entry) => entry.key).sort()).toEqual([
  'building-contractor-dammam',
  'demolition-dammam',
  'electrical-dammam',
  'gypsum-dammam',
  'painter-ahsa',
  'painter-jubail',
  'painter-khobar',
  'painter-qatif',
  'plumbing-dammam',
  'plumbing-khobar',
  'roof-insulation-dammam',
].sort())

expect(new Set(keywordContentWave.map((entry) => entry.summary)).size).toBe(keywordContentWave.length)
expect(new Set(keywordContentWave.map((entry) => entry.localAngle)).size).toBe(keywordContentWave.length)
```

Also extend `service-area-landings.test.ts` to assert that existing `renovation-dammam`, `renovation-khobar`, `painter-dammam`, and `annex-dammam` remain their original stable keys rather than being duplicated in the new array.

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run: `pnpm exec vitest run scripts/lib/service-area-landings.test.ts scripts/lib/keyword-content-wave.test.ts`

Expected: failure because the first-wave registry and required landing content do not exist.

- [ ] **Step 3: Write the local content records**

Add the 11 new landing records in `keyword-content-wave.ts`. Each must be a complete buyer-facing page rather than an SEO shell:

- Dammam: insulation, plumbing, electrical, gypsum board, building contractor, demolition.
- Khobar: painting and plumbing.
- Al Ahsa: painting.
- Jubail: painting.
- Qatif: painting.

For every record:

- keep one primary phrase and only close variants;
- write a local angle based on the work sequence, property context, or trade dependencies—not a claim about a neighbourhood, project, crew size, response time, or guarantee;
- use at least four deliverables, four process steps, and three non-repeated FAQs;
- include no price, artificial scarcity, or unverified accomplishment;
- reuse the corresponding existing service hero image only as a temporary semantic illustration, never label it as a local completed project.

For existing owners in `service-area-landings.ts`, add an `improve` descriptor in `keyword-content-wave.ts` that defines only additive title/summary/FAQ/internal-link refinements. Do not add a second landing record for the same service/area pair.

- [ ] **Step 4: Implement deterministic content-wave validation**

Export a pure `validateKeywordContentWave` helper that receives the existing landing keys and new entries. It must reject:

```ts
if (existingKeys.has(entry.key)) {
  throw new Error(`Existing landing must be improved, not recreated: ${entry.key}`)
}
if (seenRelations.has(`${entry.serviceKey}:${entry.areaKey}`)) {
  throw new Error(`Duplicate service-area relation: ${entry.serviceKey}:${entry.areaKey}`)
}
```

Validate each entry’s content lengths and minimum list sizes before any Sanity operation.

- [ ] **Step 5: Run the content tests**

Run: `pnpm exec vitest run scripts/lib/service-area-landings.test.ts scripts/lib/keyword-content-wave.test.ts`

Expected: all records have unique keys, relations, summaries, local angles, and sufficient useful page content.

- [ ] **Step 6: Commit the first-wave source**

```bash
git add content/sorouh/service-area-landings.ts content/sorouh/seo/keyword-content-wave.ts scripts/lib/service-area-landings.test.ts scripts/lib/keyword-content-wave.test.ts
git commit -m "feat: add research-led local service content"
```

### Task 3: Safely apply the content wave to Sanity

**Files:**
- Create: `scripts/lib/build-keyword-content-wave-patches.ts`
- Create: `scripts/lib/build-keyword-content-wave-patches.test.ts`
- Create: `scripts/apply-keyword-content-wave.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `keywordContentWave`, `serviceAreaLandings`, `SERVICE_KEYS`, the production Sanity client, and existing document IDs.
- Produces: an idempotent transaction plan that creates missing first-wave documents and patches only the explicit existing owners.

- [ ] **Step 1: Add failing patch-builder tests**

Create pure builder fixtures with existing IDs and assert that the result:

```ts
expect(plan.creates.map((item) => item._id)).toContain('service-area-plumbing-dammam')
expect(plan.patches.map((item) => item.id)).toEqual([
  'service-area-annex-dammam',
  'service-area-painter-dammam',
  'service-area-renovation-dammam',
  'service-area-renovation-khobar',
])
expect(() => buildKeywordContentWavePlan({ existingIds: new Set(['service-area-plumbing-dammam']), ...fixture })).toThrow(
  'Refusing to recreate existing document: service-area-plumbing-dammam',
)
```

- [ ] **Step 2: Run the patch-builder test and confirm it fails**

Run: `pnpm exec vitest run scripts/lib/build-keyword-content-wave-patches.test.ts`

Expected: failure because the pure planner does not yet exist.

- [ ] **Step 3: Implement the pure document planner**

Create `buildKeywordContentWavePlan` that takes content records, a service-key-to-document-ID map, an area-key-to-document-ID map, and existing IDs. It must produce:

- `creates`: full `serviceAreaLanding` documents with IDs `service-area-<key>`;
- `patches`: only named existing-owner IDs and only the approved fields;
- `unchanged`: all other existing documents.

Build Portable Text and FAQ keys deterministically using the established seed helpers or equivalent local pure helpers. Reuse the service hero reference returned by Sanity; do not upload new media in this task.

- [ ] **Step 4: Implement dry-run/apply CLI with production guards**

Create `scripts/apply-keyword-content-wave.ts` patterned after `scripts/apply-seo-expansion.ts`:

```ts
const EXPECTED_PROJECT_ID = 'ki7bs4vk'
const DATASET = 'production'
const dryRun = process.argv.includes('--dry-run')
const apply = process.argv.includes('--apply')
if (dryRun === apply) throw new Error('Choose exactly one mode: --dry-run or --apply')
```

Fetch services, areas, target landing IDs, and hero images before building the plan. On `--dry-run`, print only counts and document IDs. On `--apply`, run one Sanity transaction, re-fetch every created and patched record, and verify the exact service and area references, title, and canonical relation.

Add scripts:

```json
"seo:keyword-wave:dry": "pnpm --dir studio exec sanity exec ../scripts/apply-keyword-content-wave.ts --with-user-token -- --dry-run",
"seo:keyword-wave": "pnpm --dir studio exec sanity exec ../scripts/apply-keyword-content-wave.ts --with-user-token -- --apply"
```

- [ ] **Step 5: Run unit checks and the live dry-run**

Run:

```bash
pnpm exec vitest run scripts/lib/build-keyword-content-wave-patches.test.ts
pnpm seo:keyword-wave:dry
```

Expected: all unit tests pass; dry-run names only the 11 new documents and four explicit existing-owner improvements.

- [ ] **Step 6: Apply and verify the content transaction**

Run: `pnpm seo:keyword-wave`

Expected: transaction reports the expected create/patch counts and refetch verification passes. Do not continue if any target relation is duplicated or missing.

- [ ] **Step 7: Commit the safe publisher**

```bash
git add scripts/lib/build-keyword-content-wave-patches.ts scripts/lib/build-keyword-content-wave-patches.test.ts scripts/apply-keyword-content-wave.ts package.json
git commit -m "feat: publish research-led keyword content wave"
```

### Task 4: Regenerate, validate, and deploy the indexed site

**Files:**
- Modify: `scripts/verify-production.ts` only if it lacks first-wave route assertions.
- Test: `scripts/verify-production.test.ts`
- Generated: `web/src/data/site-snapshot.json` through the existing build snapshot process.

**Interfaces:**
- Consumes: published Sanity content and the content loader.
- Produces: generated local routes, sitemap URLs, canonical/schema markup, and production response checks.

- [ ] **Step 1: Add failing production route expectations**

Add the first-wave route set to the production verifier fixture:

```ts
const requiredKeywordWavePaths = [
  '/الخدمات/عزل-الاسطح/الدمام/',
  '/الخدمات/اعمال-السباكة/الدمام/',
  '/الخدمات/اعمال-الكهرباء/الدمام/',
  '/الخدمات/دهانات-داخلية-وخارجية/الخبر/',
  '/الخدمات/دهانات-داخلية-وخارجية/الاحساء/',
]
```

Assert every path is canonical, returns a 200 production response, is present in `sitemap-index.xml` or its referenced sitemap, and contains the service-area relation in structured data.

- [ ] **Step 2: Run the focused verifier test and confirm it fails before new content is built**

Run: `pnpm exec vitest run scripts/verify-production.test.ts`

Expected: route assertions fail until the Sanity transaction and build are complete.

- [ ] **Step 3: Build from current published Sanity data**

Run:

```bash
pnpm seo:validate-targets
pnpm --filter @sorouh/web build
```

Expected: snapshot generation includes the expanded service-area landing count; Astro builds each new canonical route; `validate-dist.ts` passes.

- [ ] **Step 4: Run static and end-to-end checks**

Run:

```bash
pnpm --filter @sorouh/web test
pnpm --filter @sorouh/web test:e2e
pnpm --filter @sorouh/web test:build
```

Expected: content, schema, discovery, navigation, and route tests pass with no duplicate URL or canonical error.

- [ ] **Step 5: Deploy after local evidence passes**

Run:

```bash
pnpm --filter @sorouh/web run deploy -- --dry-run
pnpm --filter @sorouh/web run deploy
```

Expected: Wrangler validates the asset bundle, then reports a new production version for `sorouh.site`.

- [ ] **Step 6: Verify the live release**

Run: `pnpm verify:production`

Expected: the live site, sitemap, canonical redirect behavior, GTM installation, and every required first-wave URL pass.

- [ ] **Step 7: Commit verification changes**

```bash
git add scripts/verify-production.ts scripts/verify-production.test.ts web/src/data/site-snapshot.json
git commit -m "test: verify keyword content wave in production"
```

### Task 5: Prepare the measured second-wave queue

**Files:**
- Modify: `content/sorouh/seo/keyword-targets.ts`
- Modify: `content/sorouh/seo/keyword-research.ts`
- Create: `docs/seo/keyword-wave-measurement.md`

**Interfaces:**
- Consumes: first-wave URLs, Search Console data, GA4 `contact_click` events, and keyword ownership registry.
- Produces: a time-bounded second-wave decision queue, not automatic city-page proliferation.

- [ ] **Step 1: Document decision thresholds**

Create `docs/seo/keyword-wave-measurement.md` specifying that a candidate moves to active only when it has measured demand, no ownership collision, a supported service, a distinct local angle, and either Search Console evidence or a stable 30-day crawl/impression observation after the first wave.

- [ ] **Step 2: Keep named candidates non-active**

Maintain candidates for: painting Dhahran/Saihat, plumbing Al Ahsa/Jubail/Qatif/Saihat/Dhahran, electrical Jubail/Al Ahsa/Qatif/Saihat/Khobar, gypsum board Al Ahsa/Khobar/Jubail/Qatif, tile Dammam, concrete cutting Dammam, and leak detection Dammam. They must have no owner route while their status is `candidate` or `monitor`.

- [ ] **Step 3: Validate and commit the measurement queue**

Run:

```bash
pnpm seo:validate-targets
git add content/sorouh/seo/keyword-targets.ts content/sorouh/seo/keyword-research.ts docs/seo/keyword-wave-measurement.md
git commit -m "docs: queue keyword content decisions by evidence"
```

Expected: no candidate can accidentally become an indexed duplicate URL.

## Plan Self-Review

- Spec coverage: Tasks 1–2 implement exclusive keyword ownership and unique local content; Task 3 applies it safely; Task 4 verifies and deploys it; Task 5 prevents uncontrolled future expansion.
- Placeholder scan: no deferred implementation markers or unspecified validation paths remain.
- Type consistency: the registry, content-wave source, pure planner, and CLI all use stable service/area keys and stable `service-area-<key>` document IDs.
