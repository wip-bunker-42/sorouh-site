# Sorouh SEO Growth Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** تحويل البحث والفهرسة والروابط وظهور محركات الإجابة إلى دورة تشغيل شهرية موثقة تنتج قرارات مباشرة دون إنشاء dashboard.

**Architecture:** تُحفظ قواعد الصادرات والمراجعة والسلطة في runbooks وسجلات Markdown صغيرة، بينما يولد الموقع `llms.txt` ديناميكيًا من snapshot المنشور. تبقى ملفات CSV الخام خارج Git، وتنتقل القرارات فقط إلى سجل الكلمات والمحتوى والكود.

**Tech Stack:** TypeScript، Vitest، Astro static build، Google Search Console، Bing Webmaster Tools، GA4، Ahrefs exports، Cloudflare Crawler Hints، Markdown.

**Spec:** `docs/superpowers/specs/2026-08-26-sorouh-seo-growth-design.md`

## Global Constraints

- تعتمد هذه الخطة على خطتي الأساس والقياس وتوسعة المحتوى.
- لا dashboard أو قاعدة بيانات تقارير مخصصة.
- ملفات CSV/XLSX الخام من الحسابات لا تُرفع إلى Git؛ يحتفظ المستودع بالمنهج والقرارات غير الحساسة فقط.
- لا يُنشأ Google Business Profile حتى تتوفر متطلبات التحقق.
- لا روابط جماعية أو أدلة بلا صلة أو claims غير قابلة للإثبات.
- لا قرار حذف أو redirect من لقطة قصيرة؛ يلزم اتجاه وسبب موثق.
- كل تحديث تقني أو تحريري يمر ببوابات المشروع المعتادة.

## File Structure

- `.gitignore`: استبعاد `research/seo/exports/`.
- `research/seo/README.md`: أسماء الصادرات وفترات القياس وطريقة التسليم.
- `docs/seo/monthly-review.md`: قالب مراجعة قرار، لا لوحة.
- `docs/seo/answer-engine-review.md`: قالب اختبار فهم الكيان والاستشهاد في محركات الإجابة.
- `docs/seo/authority-register.md`: منافسون وفرص mentions/links وحالة التحقق.
- `docs/seo/indexation-runbook.md`: فحص الفهرسة والزحف بعد النشر.
- `web/src/lib/seo/llms.ts`: توليد `llms.txt` من snapshot.
- `web/src/lib/tests/llms.test.ts`: اختبارات المحتوى والروابط والـnoindex.
- `web/scripts/prepare-build.ts`: كتابة الناتج المولد.
- `docs/deployment-runbook.md`: ربط الدورة بالنشر.

---

### Task 1: Export Intake Contract

**Files:**
- Modify: `.gitignore`
- Create: `research/seo/README.md`
- Create: `docs/seo/monthly-review.md`
- Create: `docs/seo/answer-engine-review.md`

**Interfaces:**
- Consumes: CSV أو XLSX من GSC وBing وGA4 وAhrefs.
- Produces: أسماء ثابتة للملفات وقالب قرار ينتهي بإجراء واحد أو أكثر.

- [ ] **Step 1: Add a failing repository hygiene test**

Modify `scripts/toolchain.test.ts`:

```ts
test('keeps account exports outside version control', () => {
  const ignore = readFileSync(resolve('.gitignore'), 'utf8')
  expect(ignore).toContain('research/seo/exports/')
})
```

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm vitest run scripts/toolchain.test.ts`

Expected: FAIL because the export directory is not ignored.

- [ ] **Step 3: Ignore raw exports and document exact filenames**

Add:

```gitignore
# Account-bound SEO exports; decisions belong in tracked docs, raw files do not.
research/seo/exports/
```

Create `research/seo/README.md` with this table:

```markdown
| Source | Filename | Required columns |
|---|---|---|
| GSC queries | `YYYY-MM-DD-gsc-queries-16m.csv` | Query, Clicks, Impressions, CTR, Position |
| GSC pages | `YYYY-MM-DD-gsc-pages-16m.csv` | Page, Clicks, Impressions, CTR, Position |
| GSC indexing | `YYYY-MM-DD-gsc-page-indexing.csv` | Reason, Source, Validation, Pages |
| Bing performance | `YYYY-MM-DD-bing-search-performance.csv` | Keyword/Page, Impressions, Clicks, CTR, Position |
| Bing crawl | `YYYY-MM-DD-bing-crawl-information.csv` | URL, Status, Issue, Date |
| GA4 landing pages | `YYYY-MM-DD-ga4-landing-pages-90d.csv` | Landing page, Sessions, Engaged sessions, contact_click, call_click, whatsapp_click |
| Ahrefs keywords | `YYYY-MM-DD-ahrefs-organic-keywords.csv` | Keyword, URL, Volume, Position, Traffic |
| Ahrefs top pages | `YYYY-MM-DD-ahrefs-top-pages.csv` | URL, Traffic, Keywords, Top keyword |
| Ahrefs referring domains | `YYYY-MM-DD-ahrefs-referring-domains.csv` | Domain, DR, Dofollow, First seen, Target URL |
```

State that the owner can send any subset when available; the active question determines which export is requested.

- [ ] **Step 4: Create the decision-only monthly review template**

```markdown
# مراجعة SEO — YYYY-MM-DD

## فترة ومصادر البيانات
- الفترة:
- ملفات المصدر:

## تغيرات قابلة للتصرف
| الملاحظة | الدليل | القرار | الصفحة المالكة | موعد إعادة القياس |
|---|---|---|---|---|

## فهرسة وزحف
| الحالة | العدد | URLs المتأثرة | الإجراء |
|---|---:|---|---|

## Core Web Vitals
| المصدر | URL أو مجموعة الصفحات | LCP | INP | CLS | الحالة | الإجراء |
|---|---|---:|---:|---:|---|---|

## كلمات وصفحات
| المجموعة | الصفحة | التغير | النية | الإجراء |
|---|---|---:|---|---|

## تحويلات
| landing page | contact_click | call_click | whatsapp_click | القرار |
|---|---:|---:|---:|---|

## سلطة وروابط
| الفرصة أو الرابط | الصلة | الحالة | الإجراء التالي |
|---|---|---|---|
```

Create `docs/seo/answer-engine-review.md` with this repeatable matrix:

```markdown
# مراجعة محركات الإجابة — YYYY-MM-DD

## طريقة الاختبار
- جلسة جديدة غير مخصصة، باللغة العربية، مع تسجيل اسم المحرك وتاريخ الاختبار.
- لا يُعاد السؤال بصيغ متعددة لاختيار نتيجة أفضل؛ تحفظ أول إجابة قابلة للمراجعة.
- لا تُعامل إجابة النموذج كترتيب ثابت أو دليل تحويل.

## الاستعلامات الثابتة
1. شركة مقاولات عامة في الدمام
2. مقاول ترميم فلل في الخبر
3. من ينفذ عزل أسطح في الأحساء
4. مقاول بناء ملاحق في الدمام
5. كشف ومعالجة تسربات المياه في المنطقة الشرقية
6. مقاول هدم وإزالة في الدمام

## النتائج
| المحرك | الاستعلام | هل ظهر صروح؟ | URL المذكور أو المستشهد به | وصف الكيان والخدمة والمنطقة | خطأ واقعي | الإجراء داخل الموقع |
|---|---|---|---|---|---|---|

المحركات المطلوبة: ChatGPT، Gemini، Copilot، Perplexity. الإجراء داخل الموقع يكون واحدًا من: `none`, `clarify-entity`, `clarify-service`, `clarify-area`, `strengthen-evidence`, `strengthen-links`.
```

- [ ] **Step 5: Run hygiene and formatting checks**

Run: `pnpm vitest run scripts/toolchain.test.ts && pnpm check:format`

Expected: PASS.

- [ ] **Step 6: Commit the intake contract**

```bash
git add .gitignore research/seo/README.md docs/seo/monthly-review.md docs/seo/answer-engine-review.md scripts/toolchain.test.ts
git commit -m "docs: define SEO export intake contract"
```

### Task 2: Dynamic llms.txt Discovery Document

**Files:**
- Create: `web/src/lib/seo/llms.ts`
- Create: `web/src/lib/tests/llms.test.ts`
- Modify: `web/scripts/prepare-build.ts`

**Interfaces:**
- Consumes: `NormalizedSnapshot` and `SITE_ORIGIN`.
- Produces: `generateLlmsText(snapshot, origin): string` containing only indexable published routes.

- [ ] **Step 1: Write failing discovery tests**

```ts
import { describe, expect, test } from 'vitest'
import { loadSnapshot } from '../content/load-snapshot'
import { generateLlmsText } from '../seo/llms'

describe('llms discovery text', () => {
  test('lists named services, areas, projects, and articles with absolute URLs', () => {
    const output = generateLlmsText(loadSnapshot(), 'https://sorouh.site')
    expect(output).toContain('## الخدمات')
    expect(output).toContain('https://sorouh.site/الخدمات/')
    expect(output).toContain('## مناطق الخدمة')
    expect(output).toContain('## مشاريع مختارة')
    expect(output).toContain('## أدلة ومقالات')
  })

  test('omits noindex documents and contains no HTML', () => {
    const snapshot = structuredClone(loadSnapshot())
    snapshot.services[0].seo.noIndex = true
    const output = generateLlmsText(snapshot, 'https://sorouh.site')
    expect(output).not.toContain(`/الخدمات/${snapshot.services[0].slug}/`)
    expect(output).not.toMatch(/<[^>]+>/)
  })
})
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/llms.test.ts`

Expected: FAIL because `../seo/llms` does not exist.

- [ ] **Step 3: Implement bounded dynamic output**

```ts
import type { NormalizedSnapshot } from '../content/normalize'

const absolute = (origin: string, path: string) => new URL(path, origin).href
const line = (title: string, summary: string, url: string) =>
  `- [${title}](${url}): ${summary.replace(/\s+/g, ' ').trim()}`

export function generateLlmsText(snapshot: NormalizedSnapshot, origin: string): string {
  const services = snapshot.services.filter((item) => !item.seo.noIndex)
  const areas = snapshot.areas.filter((item) => !item.seo.noIndex)
  const projects = snapshot.projects.filter((item) => !item.seo.noIndex).slice(0, 12)
  const posts = snapshot.posts.filter((item) => !item.seo.noIndex).slice(0, 12)
  return [
    `# ${snapshot.siteSettings.companyName}`,
    '', 'مقاولات عامة وترميم وتشطيب وخدمات تنفيذ للمنازل والفلل في المنطقة الشرقية بالمملكة العربية السعودية.', '',
    `الموقع الرسمي: ${absolute(origin, '/')}`,
    `التواصل: ${snapshot.siteSettings.primaryPhone} — اتصال وواتساب.`,
    '', '## الخدمات',
    ...services.map((item) => line(item.title, item.summary, absolute(origin, `/الخدمات/${item.slug}/`))),
    '', '## مناطق الخدمة',
    ...areas.map((item) => line(item.title, item.summary, absolute(origin, `/مناطق-الخدمة/${item.slug}/`))),
    '', '## مشاريع مختارة',
    ...projects.map((item) => line(item.title, item.summary, absolute(origin, `/مشاريعنا/${item.slug}/`))),
    '', '## أدلة ومقالات',
    ...posts.map((item) => line(item.title, item.excerpt, absolute(origin, `/المدونة/${item.slug}/`))),
    '',
  ].join('\n')
}
```

- [ ] **Step 4: Replace the inline text writer**

Import `generateLlmsText` in `prepare-build.ts` and write:

```ts
writeFile(resolve(publicDir, 'llms.txt'), generateLlmsText(snapshot, SITE_ORIGIN))
```

- [ ] **Step 5: Run unit and build tests**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/llms.test.ts`

Expected: PASS.

Run: `pnpm --filter @sorouh/web test:build`

Expected: PASS and `dist/llms.txt` lists current indexable services and areas.

- [ ] **Step 6: Commit discovery generation**

```bash
git add web/src/lib/seo/llms.ts web/src/lib/tests/llms.test.ts web/scripts/prepare-build.ts
git commit -m "feat: generate llms discovery from published content"
```

### Task 3: Indexation and Crawl Runbook

**Files:**
- Create: `docs/seo/indexation-runbook.md`
- Modify: `docs/deployment-runbook.md`
- Modify: `docs/release-checklist.md`

**Interfaces:**
- Consumes: sitemap, Search Console, Bing URL Inspection, and production URLs.
- Produces: one evidence row per sampled URL and a clear response per exclusion class.

- [ ] **Step 1: Write the exact sampling matrix**

Create this table in the runbook:

```markdown
| Route family | Required sample |
|---|---|
| Home | `/` |
| Service | highest-demand new service + one existing service |
| Area | `/مناطق-الخدمة/الدمام/` + one secondary city |
| Service × area | every newly published local landing in its first review |
| Project | newest project with original media |
| Article | newest article + highest-impression article |
| Discovery | `/sitemap.xml`, `/sitemap-pages.xml`, `/robots.txt`, `/llms.txt` |
```

- [ ] **Step 2: Document exact checks per URL**

For each sample record: HTTP status, final URL, canonical, robots, sitemap membership, Google indexed state, Google last crawl, Bing indexed state, Bing crawl issue, rich-result/schema result, and nearest internal-link source.

Map responses:

```text
Discovered/Crawled currently not indexed → compare content uniqueness and internal links; wait through one normal crawl cycle before resubmission.
Duplicate without user-selected canonical → inspect canonical, redirects, and near-duplicate owner; fix ownership before requesting recrawl.
Soft 404 → strengthen or merge the page; never mask with status 200 text changes alone.
Blocked by robots/noindex → compare published HTML and Sanity state; correct only if the page is approved for indexing.
Server/redirect error → reproduce from production, fix route/Cloudflare rule, rerun verify:production.
```

- [ ] **Step 3: Link the runbook from deployment and release docs**

After every production content expansion, require the sample matrix once Cloudflare finishes. Do not request indexing for every sitemap URL.

- [ ] **Step 4: Verify current production discovery endpoints**

Run: `pnpm verify:production`

Expected: PASS.

Manually inspect the sample URLs in Search Console and Bing; record results in the first copied monthly review, not in the runbook itself.

- [ ] **Step 5: Record performance and crawler-notification checks**

Add these rules to the runbook:

```text
Core Web Vitals: review the GSC mobile and desktop reports monthly. For `/`, the highest-demand service, and the newest local landing, run PageSpeed Insights once after publication and record field data when available plus lab LCP/CLS/TBT as diagnostic evidence. A lab score alone never closes a field CWV issue.
Crawler Hints: confirm Cloudflare still reports `crawlhints_enabled=true` after any zone or cache configuration change and quarterly thereafter. Keep the existing Crawler Hints integration; do not add a second custom IndexNow submission path.
Images: when LCP or transfer size regresses, inspect the actual hero request, intrinsic dimensions, preload behavior, and compressed size before changing layout or adding dependencies.
```

- [ ] **Step 6: Commit the runbook**

```bash
git add docs/seo/indexation-runbook.md docs/deployment-runbook.md docs/release-checklist.md
git commit -m "docs: add indexation and crawl operating loop"
```

### Task 4: Authority and Competitor Register

**Files:**
- Create: `docs/seo/authority-register.md`
- Create: `docs/seo/competitor-review.md`

**Interfaces:**
- Consumes: SERP review and Ahrefs referring-domain/top-page exports.
- Produces: verified opportunity rows; no external profile or link is marked acquired without a live URL.

- [ ] **Step 1: Add the initial competitor set from reviewed SERPs**

```markdown
| Domain | Observed cluster | Page type to compare |
|---|---|---|
| rah-saudi.com | مقاولات وبناء وترميم | Home + services + cities |
| dammamrenovations.com | ترميم الدمام والخبر | Home + renovation pages |
| azawya.com | ترميم وتشطيب | Service and project proof |
| tarmimdammam.com | ترميم وخدمات محلية | Service × city architecture |
| afaqsharqia.com | دهانات وجبس وتشطيب | Specialized service pages |
| awazldammam.com | عزل الأسطح | Insulation service depth |
| aldmam.com | عزل الأسطح | Local neighborhoods and informational depth |
| jebsbord-dammam.com | جبس بورد الدمام | Specialist landing-page intent |
```

For every domain review: title/H1 ownership, route structure, content sections, evidence/media, internal links, referring domains, and the gap Sorouh can answer better.

- [ ] **Step 2: Create the authority register with explicit states**

```markdown
| Opportunity | Type | Target page | Relevance | Verification requirement | State | Live URL | Next action |
|---|---|---|---|---|---|---|---|
| YouTube channel/site link | owned profile | home/project | high | signed-in channel and live about link | research |  | confirm account access |
| Bing business/profile eligibility | citation | home | high | platform accepts service-area activity with available business facts | research |  | inspect current requirements |
| Supplier project mention | earned link | matching service | high | real supplier/project relationship | research |  | request supplier list from client |
| Saudi contractor directory | citation | home | medium | current eligibility without invented registration | research |  | verify requirements before submission |
| Local project case-study mention | earned/editorial | project page | high | original project media and partner permission | research |  | select one documented project |
```

Allowed states: `research`, `eligible`, `submitted`, `live`, `rejected`, `not-applicable`. A row moves to `live` only with a checked public URL.

- [ ] **Step 3: Review one backlink export and one SERP cluster**

Request `ahrefs-referring-domains.csv` only after selecting a competitor cluster. Add opportunities with domain, target competitor URL, link context, Sorouh target page, and eligibility evidence. Do not copy irrelevant domains merely because their DR is high.

- [ ] **Step 4: Add owned-media links first**

Where signed-in accounts exist, update the YouTube channel/about and each relevant video description with the canonical Sorouh page matching that video. Record the exact live URLs. Do not create a business listing that requires unavailable address or registration data.

- [ ] **Step 5: Commit the registers**

```bash
git add docs/seo/authority-register.md docs/seo/competitor-review.md
git commit -m "docs: establish SEO authority opportunity register"
```

### Task 5: First Monthly Decision Review

**Files:**
- Create: `docs/seo/reviews/2026-09-initial-review.md`
- Create: `docs/seo/reviews/2026-09-answer-engines.md`
- Modify: `content/sorouh/seo/keyword-targets.ts`

**Interfaces:**
- Consumes: first available GSC/Bing/GA4/Ahrefs exports and live SERPs.
- Produces: decisions with owner pages and re-measure dates; updates registry statuses only when supported.

- [ ] **Step 1: Capture a clean baseline date**

Use a copy of `docs/seo/monthly-review.md`. Fill the actual export filenames, date ranges, total indexed pages in Google and Bing, total non-brand impressions/clicks, and current contact events. Use `not available — <reason>` only when an account has not accumulated the metric; do not enter zero for unavailable data.

- [ ] **Step 2: Classify every action into one of five outcomes**

```text
expand — owner is correct and demand/visibility is growing.
refresh — owner is correct but snippet/content does not answer the observed intent.
link — page is indexable but internally weak or orphan-adjacent.
merge — two pages compete for the same group without distinct SERP intent.
monitor — data is too young or too sparse for a structural change.
```

- [ ] **Step 3: Update the keyword registry from evidence**

For every changed target, update `source`, `researchedAt`, `avgMonthlySearches` when a fresh Keyword Planner result exists, and `status`/`ownerPath` only when the monthly review contains the same decision. Keep the old review file as the audit trail.

- [ ] **Step 4: Run registry and full quality checks**

Run: `pnpm seo:validate-targets && pnpm check`

Expected: PASS with no active keyword collision or missing owner route.

- [ ] **Step 5: Run the first answer-engine sample**

Copy `docs/seo/answer-engine-review.md` to `docs/seo/reviews/2026-09-answer-engines.md`. Run all six fixed queries once in ChatGPT, Gemini, Copilot, and Perplexity. Record citations/URLs and factual interpretation; never report visibility when Sorouh is absent, and never change site claims to imitate a hallucinated answer. Convert only repeated, verifiable understanding gaps into one of the permitted on-site actions.

- [ ] **Step 6: Commit the review and decisions**

```bash
git add docs/seo/reviews/2026-09-initial-review.md docs/seo/reviews/2026-09-answer-engines.md content/sorouh/seo/keyword-targets.ts
git commit -m "docs: record initial SEO performance decisions"
```

### Task 6: Program Verification and Next-Cycle Handoff

**Files:**
- Modify only files required by evidence-backed failures.

**Interfaces:**
- Consumes: all three implementation plans.
- Produces: passing CI, verified production, current decision review, and explicit next-cycle actions.

- [ ] **Step 1: Run all local quality gates**

Run:

```bash
pnpm check
pnpm test:e2e
pnpm --dir web deploy:dry
```

Expected: every command exits 0.

- [ ] **Step 2: Verify production**

Run: `pnpm verify:production`

Expected: all required service and local URLs return 200, self-canonical, indexable HTML and sitemap membership.

- [ ] **Step 3: Verify measurement and discovery manually**

Confirm a call click and WhatsApp click in GA4 Realtime/DebugView, inspect one new service and one local landing in Search Console and Bing, and fetch production `llms.txt` to confirm current services and absolute URLs.

- [ ] **Step 4: Reconcile Git and evidence**

Run: `git status --short --branch && git diff --check`

Expected: clean working tree. The review file names every source used and every next action has a page owner and re-measure date.

- [ ] **Step 5: Close verification without an unspecified repair**

If any command or manual check fails, stop this verification task, diagnose that concrete failure under `superpowers:systematic-debugging`, add a named fix task with its exact files and focused regression test, and rerun this task from Step 1. If every check passes, create no verification-only commit.
