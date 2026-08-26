# Sorouh SEO Foundation and Measurement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** إنشاء مصدر بيانات موثوق لملكية الكلمات، تقوية بوابات SEO التقنية، وتفعيل قياس الاتصال والواتساب عبر GTM وGA4 دون بناء لوحة مخصصة.

**Architecture:** تُحفظ لقطة البحث غير السرية وخريطة ملكية الكلمات داخل `content/sorouh/seo` وتتحقق منها دوال TypeScript مستقلة قبل البناء. يُفصل توليد Schema وفحص HTML عن مكونات Astro لتسهيل الاختبار، بينما يظل GTM اختياريًا ويُفعّل من بيئة Cloudflare فقط.

**Tech Stack:** TypeScript 6.0.3، Vitest 4، Astro 7، Cheerio، Sanity 6، Google Tag Manager، Google Analytics 4، Cloudflare Workers Builds.

**Spec:** `docs/superpowers/specs/2026-08-26-sorouh-seo-growth-design.md`

## Global Constraints

- اللغة العامة `ar-SA` واتجاه RTL والدومين الأساسي `https://sorouh.site`.
- Node.js `22.12.0+` وpnpm `11.11.0`، مع lockfile واحد وعدم إضافة مكتبة ما لم تكن لازمة.
- لا قائمة خدمات نهائية ثابتة، ولا مصفوفة آلية لكل خدمة ومدينة.
- لا dashboard مخصص؛ القياس من GTM وGA4 وSearch Console وBing والنتائج المباشرة.
- لا credentials أو access tokens أو refresh tokens في الملفات أو commits أو مخرجات الاختبارات.
- كل مجموعة كلمات نشطة لها صفحة مالكة واحدة، والمرشح غير المنشور لا يدخل sitemap.
- التغييرات تتبع TDD، وكل مهمة تنتهي باختبار مستقل وcommit صغير.

## File Structure

- `content/sorouh/seo/keyword-targets.ts`: لقطة البحث غير السرية وقرارات ملكية الكلمات.
- `scripts/lib/seo-keyword-targets.ts`: الأنواع والتطبيع والتحقق من الملكية والمسارات.
- `scripts/lib/seo-keyword-targets.test.ts`: اختبارات السجل والقواعد.
- `web/src/lib/seo/schema.ts`: بناء graph البيانات المنظمة بدون اعتماد على Astro.
- `web/src/lib/tests/schema.test.ts`: اختبارات IDs والعلاقات والأنواع.
- `web/src/lib/seo/dist-audit.ts`: فحص HTML المولد والروابط الداخلية والصفحات اليتيمة.
- `web/src/lib/tests/dist-audit.test.ts`: اختبارات وحدات التدقيق.
- `web/scripts/validate-dist.ts`: adapter ملفات فقط يستدعي التدقيق النقي.
- `web/public/contact-events.js`: payload حدث التحويل.
- `web/src/lib/tests/gtm.test.ts`: اختبارات تكامل script وبيانات الحدث.
- `web/.env.example`: توثيق `PUBLIC_GTM_ID`.
- `docs/analytics-setup.md`: خطوات GA4/GTM وDebugView والأحداث.
- `docs/release-checklist.md`: حالة الربط والبوابات الديناميكية.

---

### Task 1: Typed Keyword Ownership Registry

**Files:**
- Create: `scripts/lib/seo-keyword-targets.ts`
- Create: `scripts/lib/seo-keyword-targets.test.ts`
- Create: `scripts/validate-seo-keyword-targets.ts`
- Create: `content/sorouh/seo/keyword-targets.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: قائمة المسارات الحية بصيغة `ReadonlySet<string>`.
- Produces: `KeywordTarget`, `KeywordTargetStatus`, `normalizeKeyword()`, و`validateKeywordTargets(targets, livePaths)`.

- [ ] **Step 1: Write the failing registry tests**

```ts
import { describe, expect, test } from 'vitest'
import { validateKeywordTargets, type KeywordTarget } from './seo-keyword-targets'

const livePaths = new Set(['/الخدمات/ترميم-منازل-وفلل/', '/مناطق-الخدمة/الدمام/'])

const target = (overrides: Partial<KeywordTarget> = {}): KeywordTarget => ({
  id: 'renovation-dammam',
  primaryKeyword: 'مقاول ترميم الدمام',
  variants: ['ترميم الدمام'],
  intent: 'transactional',
  geography: 'الدمام',
  status: 'active',
  ownerPath: '/مناطق-الخدمة/الدمام/',
  source: 'google-ads-api-v25',
  researchedAt: '2026-08-26',
  avgMonthlySearches: 1600,
  ...overrides,
})

describe('SEO keyword targets', () => {
  test('accepts one live owner for every active target', () => {
    expect(validateKeywordTargets([target()], livePaths)).toEqual({ active: 1, candidates: 0 })
  })

  test('rejects a normalized keyword owned by two active targets', () => {
    expect(() =>
      validateKeywordTargets(
        [target(), target({ id: 'duplicate', primaryKeyword: ' ترميم   الدمام ' })],
        livePaths,
      ),
    ).toThrow('Keyword collision: ترميم الدمام')
  })

  test('rejects an active owner that is not a live route', () => {
    expect(() =>
      validateKeywordTargets([target({ ownerPath: '/الخدمات/غير-موجود/' })], livePaths),
    ).toThrow('Active target renovation-dammam owns missing route')
  })

  test('allows a researched candidate without an owner route', () => {
    expect(
      validateKeywordTargets(
        [target({ status: 'candidate', ownerPath: undefined })],
        livePaths,
      ),
    ).toEqual({ active: 0, candidates: 1 })
  })
})
```

- [ ] **Step 2: Run the focused test and verify the missing module failure**

Run: `pnpm vitest run scripts/lib/seo-keyword-targets.test.ts`

Expected: FAIL because `scripts/lib/seo-keyword-targets.ts` does not exist.

- [ ] **Step 3: Implement the registry types and validator**

```ts
export type KeywordIntent = 'transactional' | 'commercial' | 'informational'
export type KeywordTargetStatus = 'active' | 'candidate' | 'monitor' | 'merged'

export type KeywordTarget = {
  id: string
  primaryKeyword: string
  variants: string[]
  intent: KeywordIntent
  geography: string
  status: KeywordTargetStatus
  ownerPath?: string
  source: 'google-ads-api-v25' | 'search-console' | 'bing' | 'ahrefs' | 'serp-review'
  researchedAt: string
  avgMonthlySearches?: number
}

export function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, ' ').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').toLowerCase()
}

export function validateKeywordTargets(
  targets: readonly KeywordTarget[],
  livePaths: ReadonlySet<string>,
): { active: number; candidates: number } {
  const activeKeywords = new Map<string, string>()
  let active = 0
  let candidates = 0

  for (const target of targets) {
    if (!target.id || !target.primaryKeyword.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(target.researchedAt)) {
      throw new Error(`Invalid keyword target: ${target.id || '(missing id)'}`)
    }
    if (target.status === 'candidate') candidates += 1
    if (target.status !== 'active') continue
    active += 1
    if (!target.ownerPath || !livePaths.has(target.ownerPath)) {
      throw new Error(`Active target ${target.id} owns missing route: ${target.ownerPath ?? '(none)'}`)
    }
    for (const keyword of [target.primaryKeyword, ...target.variants]) {
      const normalized = normalizeKeyword(keyword)
      const existing = activeKeywords.get(normalized)
      if (existing && existing !== target.id) throw new Error(`Keyword collision: ${keyword.trim()}`)
      activeKeywords.set(normalized, target.id)
    }
  }

  return { active, candidates }
}
```

- [ ] **Step 4: Add the reviewed baseline targets**

```ts
import type { KeywordTarget } from '../../../scripts/lib/seo-keyword-targets'

export const SEO_KEYWORD_TARGETS = [
  {
    id: 'general-contracting',
    primaryKeyword: 'شركة مقاولات',
    variants: ['مقاولات عامة', 'شركة مقاولات عامة'],
    intent: 'commercial',
    geography: 'المنطقة الشرقية',
    status: 'active',
    ownerPath: '/الخدمات/مقاولات-عامة/',
    source: 'google-ads-api-v25',
    researchedAt: '2026-08-26',
    avgMonthlySearches: 2900,
  },
  {
    id: 'renovation-dammam',
    primaryKeyword: 'مقاول ترميم الدمام',
    variants: ['ترميم الدمام'],
    intent: 'transactional',
    geography: 'الدمام',
    status: 'candidate',
    source: 'google-ads-api-v25',
    researchedAt: '2026-08-26',
    avgMonthlySearches: 1600,
  },
  {
    id: 'roof-insulation',
    primaryKeyword: 'عزل اسطح',
    variants: ['عوازل اسطح', 'شركة عزل اسطح'],
    intent: 'transactional',
    geography: 'المنطقة الشرقية',
    status: 'candidate',
    source: 'google-ads-api-v25',
    researchedAt: '2026-08-26',
    avgMonthlySearches: 5400,
  },
{
  id: 'painter-dammam', primaryKeyword: 'صباغ الدمام', variants: ['صباغ'],
  intent: 'transactional', geography: 'الدمام', status: 'candidate',
  source: 'google-ads-api-v25', researchedAt: '2026-08-26', avgMonthlySearches: 3600,
},
{
  id: 'renovation', primaryKeyword: 'مقاول ترميم', variants: ['ترميم مباني'],
  intent: 'transactional', geography: 'المنطقة الشرقية', status: 'active',
  ownerPath: '/الخدمات/ترميم-منازل-وفلل/', source: 'google-ads-api-v25',
  researchedAt: '2026-08-26', avgMonthlySearches: 2900,
},
{
  id: 'gypsum-board', primaryKeyword: 'جبس بورد', variants: ['معلم جبس بورد'],
  intent: 'transactional', geography: 'المنطقة الشرقية', status: 'active',
  ownerPath: '/الخدمات/جبس-بورد/', source: 'google-ads-api-v25',
  researchedAt: '2026-08-26', avgMonthlySearches: 2400,
},
{
  id: 'water-leak-detection', primaryKeyword: 'كشف تسربات المياه',
  variants: ['شركة كشف تسربات المياه'], intent: 'transactional',
  geography: 'المنطقة الشرقية', status: 'candidate', source: 'google-ads-api-v25',
  researchedAt: '2026-08-26', avgMonthlySearches: 2400,
},
{
  id: 'roof-insulation-ahsa', primaryKeyword: 'شركة عزل اسطح بالاحساء',
  variants: ['عزل اسطح بالاحساء'], intent: 'transactional', geography: 'الأحساء',
  status: 'candidate', source: 'google-ads-api-v25', researchedAt: '2026-08-26',
  avgMonthlySearches: 1900,
},
{
  id: 'renovation-khobar', primaryKeyword: 'مقاول ترميم الخبر',
  variants: ['ترميم الخبر'], intent: 'transactional', geography: 'الخبر',
  status: 'candidate', source: 'google-ads-api-v25', researchedAt: '2026-08-26',
  avgMonthlySearches: 590,
},
{
  id: 'ceramic-installation', primaryKeyword: 'تركيب سيراميك',
  variants: ['مبلط', 'معلم سيراميك'], intent: 'transactional',
  geography: 'المنطقة الشرقية', status: 'active',
  ownerPath: '/الخدمات/تركيب-سيراميك-وبورسلان/', source: 'google-ads-api-v25',
  researchedAt: '2026-08-26', avgMonthlySearches: 590,
},
{
  id: 'building-contractor', primaryKeyword: 'مقاول بناء',
  variants: ['مقاول بناء وترميم'], intent: 'transactional',
  geography: 'المنطقة الشرقية', status: 'active', ownerPath: '/الخدمات/مقاول-بناء/',
  source: 'google-ads-api-v25', researchedAt: '2026-08-26', avgMonthlySearches: 590,
},
{
  id: 'annex-dammam', primaryKeyword: 'بناء ملاحق الدمام',
  variants: ['مقاول بناء ملاحق بالدمام'], intent: 'transactional', geography: 'الدمام',
  status: 'candidate', source: 'google-ads-api-v25', researchedAt: '2026-08-26',
  avgMonthlySearches: 480,
},
{
  id: 'home-electrician', primaryKeyword: 'كهربائي منازل',
  variants: ['مقاول كهرباء'], intent: 'transactional', geography: 'المنطقة الشرقية',
  status: 'active', ownerPath: '/الخدمات/اعمال-الكهرباء/', source: 'google-ads-api-v25',
  researchedAt: '2026-08-26', avgMonthlySearches: 480,
},
{
  id: 'demolition-dammam', primaryKeyword: 'مقاول هدم بالدمام',
  variants: ['هدم مباني الدمام'], intent: 'transactional', geography: 'الدمام',
  status: 'candidate', source: 'google-ads-api-v25', researchedAt: '2026-08-26',
  avgMonthlySearches: 390,
},
] satisfies KeywordTarget[]
```

- [ ] **Step 5: Add a repository validator against actual content routes**

Create `scripts/validate-seo-keyword-targets.ts`:

```ts
import { areas, services } from '../content/sorouh/site-content'
import { SEO_KEYWORD_TARGETS } from '../content/sorouh/seo/keyword-targets'
import { validateKeywordTargets } from './lib/seo-keyword-targets'

const livePaths = new Set<string>([
  '/',
  '/الخدمات/',
  '/مناطق-الخدمة/',
  ...services.map((service) => `/الخدمات/${service.slug}/`),
  ...areas.map((area) => `/مناطق-الخدمة/${area.slug}/`),
])

const result = validateKeywordTargets(SEO_KEYWORD_TARGETS, livePaths)
console.log(`SEO keyword targets valid: ${result.active} active, ${result.candidates} candidates`)
```

- [ ] **Step 6: Add and run the repository script**

Add to `package.json`:

```json
"seo:validate-targets": "tsx scripts/validate-seo-keyword-targets.ts"
```

Run: `pnpm vitest run scripts/lib/seo-keyword-targets.test.ts && pnpm seo:validate-targets`

Expected: PASS with four unit tests followed by a count of current active and candidate targets; changing an active `ownerPath` to a nonexistent route must make the second command fail.

- [ ] **Step 7: Commit the registry**

```bash
git add package.json content/sorouh/seo/keyword-targets.ts scripts/lib/seo-keyword-targets.ts scripts/lib/seo-keyword-targets.test.ts scripts/validate-seo-keyword-targets.ts
git commit -m "feat: add SEO keyword ownership registry"
```

### Task 2: Pure Structured Data Graph Builders

**Files:**
- Create: `web/src/lib/seo/schema.ts`
- Create: `web/src/lib/tests/schema.test.ts`
- Modify: `web/src/layouts/BaseLayout.astro`
- Modify: `web/src/pages/الخدمات/[slug].astro`

**Interfaces:**
- Consumes: `SchemaContext`, breadcrumbs, optional page-specific nodes.
- Produces: `buildBaseSchema(context): Record<string, unknown>[]` and `buildServiceSchema(input): Record<string, unknown>`.

- [ ] **Step 1: Write failing graph relationship tests**

```ts
import { describe, expect, test } from 'vitest'
import { buildBaseSchema, buildServiceSchema } from '../seo/schema'

const context = {
  origin: 'https://sorouh.site',
  canonical: 'https://sorouh.site/الخدمات/مقاولات-عامة/',
  title: 'مقاولات عامة في المنطقة الشرقية | صروح الشرقية',
  description: 'تنفيذ وإدارة أعمال المقاولات في المنطقة الشرقية.',
  companyName: 'شركة صروح الشرقية للمقاولات',
  phones: ['+966546121683', '+966546745928'],
  areas: ['الدمام', 'الخبر'],
  breadcrumbs: [{ label: 'الخدمات', href: '/الخدمات/' }, { label: 'مقاولات عامة' }],
}

describe('SEO schema graph', () => {
  test('uses stable IDs and connects page, site, and contractor', () => {
    const graph = buildBaseSchema(context)
    expect(graph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'WebSite', '@id': 'https://sorouh.site/#website' }),
        expect.objectContaining({ '@type': 'GeneralContractor', '@id': 'https://sorouh.site/#organization' }),
        expect.objectContaining({
          '@type': 'WebPage',
          isPartOf: { '@id': 'https://sorouh.site/#website' },
          about: { '@id': 'https://sorouh.site/#organization' },
        }),
      ]),
    )
  })

  test('builds a service owned by the contractor and served in named places', () => {
    expect(
      buildServiceSchema({
        origin: context.origin,
        path: '/الخدمات/مقاولات-عامة/',
        name: 'مقاولات عامة',
        description: context.description,
        areas: context.areas,
      }),
    ).toMatchObject({
      '@type': 'Service',
      provider: { '@id': 'https://sorouh.site/#organization' },
      areaServed: [{ '@type': 'City', name: 'الدمام' }, { '@type': 'City', name: 'الخبر' }],
    })
  })
})
```

- [ ] **Step 2: Run the focused test**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/schema.test.ts`

Expected: FAIL because `../seo/schema` is missing.

- [ ] **Step 3: Implement the graph builders**

```ts
type Crumb = { label: string; href?: string }
type SchemaContext = {
  origin: string
  canonical: string
  title: string
  description: string
  companyName: string
  phones: string[]
  areas: string[]
  breadcrumbs: Crumb[]
}

const absolute = (origin: string, path: string) => new URL(path, origin).href

export function buildBaseSchema(context: SchemaContext): Record<string, unknown>[] {
  const pageId = `${context.canonical}#webpage`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${context.origin}/#website`,
      url: `${context.origin}/`,
      name: context.companyName,
      inLanguage: 'ar-SA',
      publisher: { '@id': `${context.origin}/#organization` },
    },
    {
      '@type': 'GeneralContractor',
      '@id': `${context.origin}/#organization`,
      name: context.companyName,
      url: `${context.origin}/`,
      logo: { '@type': 'ImageObject', url: `${context.origin}/brand/logo.png` },
      telephone: context.phones,
      areaServed: context.areas.map((name) => ({ '@type': 'City', name })),
    },
    {
      '@type': 'WebPage',
      '@id': pageId,
      url: context.canonical,
      name: context.title,
      description: context.description,
      inLanguage: 'ar-SA',
      isPartOf: { '@id': `${context.origin}/#website` },
      about: { '@id': `${context.origin}/#organization` },
    },
  ]
  if (context.breadcrumbs.length > 0) {
    const items = [{ label: 'الرئيسية', href: '/' }, ...context.breadcrumbs]
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${context.canonical}#breadcrumb`,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.href ? absolute(context.origin, item.href) : context.canonical,
      })),
    })
  }
  return graph
}

export function buildServiceSchema(input: {
  origin: string
  path: string
  name: string
  description: string
  areas: string[]
}): Record<string, unknown> {
  const url = absolute(input.origin, input.path)
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    url,
    name: input.name,
    description: input.description,
    provider: { '@id': `${input.origin}/#organization` },
    areaServed: input.areas.map((name) => ({ '@type': 'City', name })),
  }
}
```

- [ ] **Step 4: Replace inline schema construction in Astro**

In `BaseLayout.astro`, import `buildBaseSchema`, construct the context from the existing snapshot and props, then append page-specific nodes:

```ts
const graph = [
  ...buildBaseSchema({
    origin: SITE_ORIGIN,
    canonical,
    title,
    description,
    companyName: settings.companyName,
    phones: [settings.primaryPhone, settings.backupPhone],
    areas: snapshot.areas.map((area) => area.title),
    breadcrumbs,
  }),
  ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
]
```

In the service page, replace the literal service node with `buildServiceSchema(...)` and pass named areas.

- [ ] **Step 5: Run schema and build tests**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/schema.test.ts src/lib/tests/content.test.ts`

Expected: PASS.

Run: `pnpm --filter @sorouh/web test:build`

Expected: PASS and the service page JSON-LD contains `Service`, `GeneralContractor`, and stable `@id` links.

- [ ] **Step 6: Commit the schema refactor**

```bash
git add web/src/lib/seo/schema.ts web/src/lib/tests/schema.test.ts web/src/layouts/BaseLayout.astro web/src/pages/الخدمات/[slug].astro
git commit -m "refactor: centralize SEO schema graph"
```

### Task 3: Dist Metadata and Internal-Link Audit

**Files:**
- Create: `web/src/lib/seo/dist-audit.ts`
- Create: `web/src/lib/tests/dist-audit.test.ts`
- Modify: `web/scripts/validate-dist.ts`

**Interfaces:**
- Consumes: `HtmlDocument[]` with `name` and `source`, plus `siteOrigin`.
- Produces: `auditHtmlDocuments(documents, siteOrigin): DistAuditResult`.

- [ ] **Step 1: Write failing tests for duplicate metadata and orphan routes**

```ts
import { describe, expect, test } from 'vitest'
import { auditHtmlDocuments } from '../seo/dist-audit'

const page = (name: string, canonical: string, title: string, links: string[] = []) => ({
  name,
  source: `<!doctype html><html lang="ar-SA" dir="rtl"><head><title>${title}</title><meta name="description" content="وصف عربي واضح ومختلف لهذه الصفحة"><link rel="canonical" href="${canonical}"><meta name="robots" content="index, follow"></head><body><main><h1>${title}</h1>${links.map((href) => `<a href="${href}">رابط</a>`).join('')}</main></body></html>`,
})

describe('dist SEO audit', () => {
  test('rejects duplicate titles on indexable pages', () => {
    expect(() =>
      auditHtmlDocuments(
        [page('index.html', 'https://sorouh.site/', 'عنوان واحد'), page('x/index.html', 'https://sorouh.site/x/', 'عنوان واحد')],
        'https://sorouh.site',
      ),
    ).toThrow('duplicate title')
  })

  test('reports an indexable route with no incoming internal link', () => {
    expect(() =>
      auditHtmlDocuments(
        [page('index.html', 'https://sorouh.site/', 'الرئيسية'), page('x/index.html', 'https://sorouh.site/x/', 'صفحة يتيمة')],
        'https://sorouh.site',
      ),
    ).toThrow('orphan route: /x/')
  })

  test('accepts a unique page linked from the home page', () => {
    expect(
      auditHtmlDocuments(
        [page('index.html', 'https://sorouh.site/', 'الرئيسية', ['/x/']), page('x/index.html', 'https://sorouh.site/x/', 'صفحة خدمة')],
        'https://sorouh.site',
      ),
    ).toMatchObject({ indexablePages: 2, orphanPages: 0 })
  })
})
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/dist-audit.test.ts`

Expected: FAIL because the audit module is missing.

- [ ] **Step 3: Implement a pure Cheerio audit**

Implement these exact checks in `auditHtmlDocuments`:

```ts
export type HtmlDocument = { name: string; source: string }
export type DistAuditResult = { indexablePages: number; orphanPages: number }

// For every indexable page except 404:
// - exactly one H1, non-empty title and description, one canonical under siteOrigin
// - unique canonical, title, and meta description
// - collect same-origin <a href> routes after removing query/hash
// - require one incoming link for every route except '/'
// - ignore mailto:, tel:, WhatsApp, external origins, noindex pages, and 404.html
// - throw messages containing the page name and violated value
```

Use `cheerio.load`, `new URL(href, canonical)`, and `decodeURI(url.pathname)`; normalize a missing trailing slash to `/` or `${path}/` consistently with Astro.

- [ ] **Step 4: Make `validate-dist.ts` a filesystem adapter**

Keep the required-file and image/placeholder checks, collect HTML as:

```ts
const documents = await Promise.all(
  html.map(async (file) => ({ name: relative(root, file), source: await readFile(file, 'utf8') })),
)
const audit = auditHtmlDocuments(documents, 'https://sorouh.site')
console.log(`SEO audit: ${audit.indexablePages} indexable pages, ${audit.orphanPages} orphan pages.`)
```

- [ ] **Step 5: Run unit and production build validation**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/dist-audit.test.ts`

Expected: PASS.

Run: `pnpm --filter @sorouh/web test:build`

Expected: PASS; if the current content exposes a real duplicate title or orphan, fix its title or add a relevant internal link before rerunning rather than weakening the audit.

- [ ] **Step 6: Commit the audit**

```bash
git add web/src/lib/seo/dist-audit.ts web/src/lib/tests/dist-audit.test.ts web/scripts/validate-dist.ts
git commit -m "test: audit SEO metadata and internal links"
```

### Task 4: Conversion Event Payload

**Files:**
- Modify: `web/public/contact-events.js`
- Modify: `web/src/lib/tests/gtm.test.ts`
- Modify: `web/tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: links with `data-contact`, `data-contact-type`, and `data-contact-location`.
- Produces: one `dataLayer` event named `contact_click` with `contact_type`, `contact_location`, and `page_path`.

- [ ] **Step 1: Add a failing source-level payload test**

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

test('contact events include page path and no phone value', () => {
  const source = readFileSync(
    fileURLToPath(new URL('../../../public/contact-events.js', import.meta.url)),
    'utf8',
  )
  expect(source).toContain("event: 'contact_click'")
  expect(source).toContain('page_path: window.location.pathname')
  expect(source).not.toMatch(/phone|href:/)
})
```

- [ ] **Step 2: Run and verify the new assertion fails**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/gtm.test.ts`

Expected: FAIL because `page_path` is absent.

- [ ] **Step 3: Add the route to the event**

```js
window.dataLayer.push({
  event: 'contact_click',
  contact_type: target.dataset.contactType,
  contact_location: target.dataset.contactLocation,
  page_path: window.location.pathname,
})
```

- [ ] **Step 4: Add an E2E assertion with an injected dataLayer**

```ts
await page.addInitScript(() => {
  window.dataLayer = []
})
await page.goto('/الخدمات/مقاولات-عامة/')
await page.locator('[data-contact-type="whatsapp"]').first().click({ noWaitAfter: true })
const event = await page.evaluate(() => window.dataLayer?.find((item) => item.event === 'contact_click'))
expect(event).toMatchObject({
  event: 'contact_click',
  contact_type: 'whatsapp',
  page_path: '/الخدمات/مقاولات-عامة/',
})
```

If TypeScript needs the global, add the local test cast `(window as any).dataLayer` rather than changing production types.

- [ ] **Step 5: Run unit and E2E tests**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/gtm.test.ts`

Expected: PASS.

Run: `pnpm --filter @sorouh/web test:e2e -- navigation.spec.ts`

Expected: PASS and exactly one matching click event.

- [ ] **Step 6: Commit the payload change**

```bash
git add web/public/contact-events.js web/src/lib/tests/gtm.test.ts web/tests/e2e/navigation.spec.ts
git commit -m "feat: attribute contact events to page paths"
```

### Task 5: GA4 and GTM Production Configuration

**Files:**
- Modify: `web/.env.example`
- Create: `docs/analytics-setup.md`
- Modify: `docs/deployment-runbook.md`
- Modify: `docs/release-checklist.md`

**Interfaces:**
- Consumes: a user-created GTM web container and GA4 web stream for `https://sorouh.site`.
- Produces: a valid `PUBLIC_GTM_ID` in Cloudflare and GA4 events `contact_click`, with `call_click` and `whatsapp_click` marked as key events through GTM routing.

- [ ] **Step 1: Document the exact container contract**

Add to `web/.env.example`:

```dotenv
# Optional. Leave blank to emit no Google Tag Manager markup.
PUBLIC_GTM_ID=
```

Create `docs/analytics-setup.md` with these exact names:

```markdown
# إعداد GA4 وGTM لصروح

- GA4 property: `Sorouh Site`
- Web stream: `Sorouh Production` — `https://sorouh.site`
- GTM container: `Sorouh Website` — Web
- GA4 Configuration tag: `GA4 - Sorouh Production`
- Custom event tag: `GA4 Event - contact_click`
- Trigger: `Custom Event - contact_click`
- Event name: `contact_click`
- Event parameters: `contact_type`, `contact_location`, `page_path`
- GA4 derived key events: `call_click` when `contact_type` equals `call`; `whatsapp_click` when it equals `whatsapp`.
```

Document Preview verification for header, service hero, service end, area hero, area end, footer, and mobile bar.

- [ ] **Step 2: Validate the disabled build before external configuration**

Run: `pnpm --filter @sorouh/web test:build`

Expected: PASS and production fixture HTML contains neither `googletagmanager.com` nor `dataLayer` markup when `PUBLIC_GTM_ID` is blank.

- [ ] **Step 3: Create the GA4 property, stream, and GTM container in the signed-in Google account**

Use the Google UI because property creation and terms are account-bound. Record only the public Measurement ID and Container ID in the password manager or deployment configuration; do not commit them into content files.

Acceptance:

```text
GA4 data stream URL: https://sorouh.site
Enhanced measurement: reviewed
GTM Preview: connects to production
contact_click: visible with all three parameters
No telephone number or WhatsApp URL in event parameters
```

- [ ] **Step 4: Set the Cloudflare build variable and publish the container**

Set `PUBLIC_GTM_ID=GTM-...` in the Cloudflare Workers Builds production environment, republish the GTM container, and trigger a production rebuild. Do not add it to `.env` in the repository.

- [ ] **Step 5: Verify production measurement**

Check production HTML once for the loader and noscript. Trigger one call click and one WhatsApp click in GTM Preview, then confirm both in GA4 DebugView with their `page_path` and contact location.

Run: `pnpm verify:production`

Expected: PASS for origin, canonical, sitemap, and www redirect.

- [ ] **Step 6: Update operational documents and commit**

In `docs/release-checklist.md`, mark Search Console and Bing as linked, replace fixed inventory assertions with current generated counts, and mark GTM/GA4 only after DebugView succeeds.

```bash
git add web/.env.example docs/analytics-setup.md docs/deployment-runbook.md docs/release-checklist.md
git commit -m "docs: define production analytics configuration"
```

### Task 6: Full Foundation Verification

**Files:**
- Modify only files required by failures discovered in this verification.

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: clean repository, passing CI-equivalent checks, and verified production analytics.

- [ ] **Step 1: Run the complete quality gate**

Run: `pnpm check`

Expected: PASS for preflight, formatting, types, schema, TypeGen, unit tests, build tests, and dist validation.

- [ ] **Step 2: Run browser tests**

Run: `pnpm test:e2e`

Expected: PASS on desktop and mobile including Axe and contact event attribution.

- [ ] **Step 3: Run deployment dry-run**

Run: `pnpm --dir web deploy:dry`

Expected: PASS with Static Assets output and no secret values printed.

- [ ] **Step 4: Verify production after the Cloudflare rebuild**

Run: `pnpm verify:production`

Expected: PASS.

- [ ] **Step 5: Inspect the final repository state**

Run: `git status --short && git diff --check`

Expected: no uncommitted files and no whitespace errors. If any command in this task fails, stop this verification task, diagnose that concrete failure under `superpowers:systematic-debugging`, add a named fix task with its exact files and test, then rerun this task from Step 1; do not use an unspecified catch-all commit.
