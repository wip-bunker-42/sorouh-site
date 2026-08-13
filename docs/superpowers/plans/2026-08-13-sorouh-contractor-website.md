# Sorouh Contractor Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, fully populate, visually refine, verify, and deploy a Premium Arabic-only Sorouh contractor website and its Sanity Studio as an isolated, reusable code starter, with no visitor-visible placeholders and with static-first SEO/AEO on Cloudflare Workers Static Assets.

**Architecture:** A small pnpm monorepo contains `web/` (Astro 7 SSG), `studio/` (Sanity 6 Studio), `scripts/` (client bootstrap and import utilities), and `content/sorouh/` (Sorouh-only seed content plus a private review register). A media-inference pass inventories and visually groups the supplied assets into complete project records before the idempotent seed runs. A prebuild content snapshot fetches only published Sanity data once, validates completeness, generates internal redirects, and feeds every Astro route and static discovery file consistently. The public site has no runtime Worker or SSR; Cloudflare serves `web/dist` as Static Assets and enforces trailing-slash URLs. An optional build-time GTM component is completely absent when `PUBLIC_GTM_ID` is unset and needs no Sanity field.

**Tech Stack:** Node.js 24, pnpm 11, Astro 7.2.1, TypeScript 6.0.3 strict, Sanity 6.9.2, `@sanity/client` 8.0.0, GROQ 6.9.2, Sanity TypeGen, Portable Text, Wrangler 4.122.0, Vitest 4.1.10, `@playwright/test` 1.62.1, axe-core, and Cloudflare Workers Static Assets.

**Spec:** `docs/superpowers/specs/2026-08-13-sorouh-contractor-website-design.md`

## Global Constraints

- Keep all visible copy Arabic (`ar-SA`, RTL) in a professional Saudi voice. Produce a complete production-first draft from the supplied materials and approved service/area context; inferred project cities, classifications, scope, stages, and editorial outcomes are allowed and must be logged internally for later client review.
- Never create client/company names, third-party logos, licenses, registration numbers, ratings, reviews, guarantees, addresses, staff identities, or a Google Business Profile that were not provided. These limits must never be used as a reason to leave the rest of a page incomplete.
- Premium is a release requirement: custom art direction, varied compositions, strong imagery, intentional Arabic typography, polished states, and full-page visual review on small mobile, large mobile, and desktop. A merely functional or framework-default layout does not pass.
- No visitor-visible placeholders or omissions: reject `Lorem ipsum`, “سيتم الإضافة”, editor instructions, `00+`, placeholder images, `href="#"`, empty visible fields, empty sections, or project records missing title, summary, classification, service, city/service area, result copy, and media.
- The primary call/WhatsApp number is `0546121683` (`+966546121683`); the backup is `0546745928` (`+966546745928`). Both are available 24/7.
- The approved RSS author email is `info@sorouh.site`; keep visible contact CTAs limited to call and WhatsApp as previously approved.
- Use the provided logo, project media, and four YouTube URLs. Do not ship local MP4 files when the equivalent YouTube video exists.
- Every public URL ends in `/`, except actual files such as `.xml`, `.txt`, and `/404.html`. Canonicals always use `https://sorouh.site` unless a reviewed `canonicalOverride` exists.
- Sitemaps, RSS, robots, llms, JSON-LD, HTML, and `_redirects` are build-time output. There is no runtime content endpoint.
- `publishedAt` is the initial article publish date. A published document's `_updatedAt` is `dateModified` and eligible `lastmod`; omit `lastmod` when it would not accurately represent the rendered aggregate page.
- The Sanity API version is exactly `2026-08-13`; never derive it from the current date. Production builds use `useCdn: false` and the published perspective.
- Sanity image URLs use `auto=format`, explicit width/height, crop/hotspot, and responsive `srcset`; do not request `fm=avif`.
- YouTube embeds must be real `<iframe src>` elements in generated HTML with `loading="lazy"`; do not use click-to-load.
- `_redirects` contains internal path/slug redirects only. Cloudflare Always Use HTTPS and Bulk Redirect handle protocol and `www` canonicalization.
- `workers_dev` is false and `preview_urls` is true. Public branch/version previews are an accepted project choice and require no authentication work in this scope.
- Google Tag Manager is disabled by default. Set one optional build variable, `PUBLIC_GTM_ID`, to a valid `GTM-...` container ID to enable the official snippets and generic contact events; never store the ID in Sanity.
- Use Astro's normal `{value}` interpolation for text and `astro-portabletext` for rich content. Never pass Sanity editorial content to `set:html`; reserve raw insertion for trusted generated output such as serialized JSON-LD.
- Keep TypeScript on `6.0.3` while `astro check` depends on the compiler's programmatic API. Do not upgrade this project to the TypeScript 7 native compiler until Astro's checker officially supports it and the full gate passes.
- The general starter contains schemas, components, generators, tests, and empty singleton bootstrap only. It never contains Sorouh copy, services, areas, images, or SEO articles.
- Use test-driven development for behavior. Run the narrow failing test first, implement the smallest change, rerun it, then run the relevant wider checks before committing.
- Before each external CLI mutation, inspect the current official CLI help (`pnpm exec sanity ... --help`, `pnpm exec wrangler ... --help`, or `gh ... --help`) and preserve the verified output in the implementation log.
- Never commit `.env`, tokens, deploy-hook URLs, Sanity write tokens, Cloudflare credentials, generated content snapshots, imported source MP4s, or production secrets.

---

## Locked File Map

```text
.
├── .editorconfig
├── .gitignore
├── .nvmrc
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── content/
│   └── sorouh/
│       ├── asset-manifest.ts
│       ├── categories.ts
│       ├── pages.ts
│       ├── project-evidence.ts
│       ├── projects.ts
│       ├── review-register.json
│       ├── service-areas.ts
│       ├── services.ts
│       ├── site-settings.ts
│       └── posts/*.ts
├── scripts/
│   ├── bootstrap-client.ts
│   ├── preflight.ts
│   ├── seed-sorouh.ts
│   └── lib/{build-project-drafts.ts,guard-project.ts,import-assets.ts,upsert-missing.ts}
├── studio/
│   ├── .env.example
│   ├── package.json
│   ├── sanity.cli.ts
│   ├── sanity.config.ts
│   ├── schema-typegen.json
│   ├── tsconfig.json
│   └── src/
│       ├── actions/capture-slug-redirect.tsx
│       ├── components/seo-field.tsx
│       ├── constants.ts
│       ├── schemaTypes/
│       │   ├── documents/{aboutPage,category,contactPage,homePage,post,project,redirect,service,serviceArea,siteSettings}.ts
│       │   ├── objects/{cta,faqItem,portableText,seo,stat,contentImage,youtubeVideo}.ts
│       │   └── index.ts
│       ├── structure/index.ts
│       └── tests/schema.test.ts
└── web/
    ├── .env.example
    ├── astro.config.ts
    ├── package.json
    ├── playwright.config.ts
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── wrangler.jsonc
    ├── public/
    │   ├── _headers
    │   ├── brand/{logo.png,logo.webp,logo-mark.png,og-default.jpg}
    │   ├── fonts/
    │   └── icons/
    ├── scripts/{prepare-build.ts,validate-dist.ts}
    ├── src/
    │   ├── components/
    │   │   ├── analytics/GoogleTagManager.astro
    │   │   ├── content/{ArticleCta,PortableContent,RelatedPosts,ShareButtons,TableOfContents}.astro
    │   │   ├── media/{SanityImage,YouTubeEmbed}.astro
    │   │   ├── seo/{JsonLd,SeoHead}.astro
    │   │   ├── shell/{Breadcrumbs,Footer,Header,MobileActions,SkipLink}.astro
    │   │   └── ui/{CallButton,CardGrid,ProjectShowcase,SectionHeading,StatsBand,WhatsAppButton}.astro
    │   ├── data/.gitkeep
    │   ├── layouts/{ArticleLayout,BaseLayout,ContentLayout}.astro
    │   ├── lib/
    │   │   ├── analytics/gtm.ts
    │   │   ├── content/{load-snapshot,normalize,validate}.ts
    │   │   ├── seo/{jsonld,metadata,rss,sitemap}.ts
    │   │   ├── {phone,redirects,toc,url,youtube}.ts
    │   │   └── tests/*.test.ts
    │   ├── pages/
    │   │   ├── index.astro
    │   │   ├── 404.astro
    │   │   ├── من-نحن.astro
    │   │   ├── اتصل-بنا.astro
    │   │   ├── الخدمات/{index.astro,[slug].astro}
    │   │   ├── مشاريعنا/{index.astro,[slug].astro}
    │   │   ├── مناطق-الخدمة/{index.astro,[slug].astro}
    │   │   ├── المدونة/{index.astro,[slug].astro}
    │   │   ├── llms.txt.ts
    │   │   ├── robots.txt.ts
    │   │   ├── rss.xml.ts
    │   │   ├── sitemap-pages.xml.ts
    │   │   ├── sitemap-videos.xml.ts
    │   │   └── sitemap.xml.ts
    │   ├── sanity/{client,queries,sanity.types}.ts
    │   └── styles/{global,prose,tokens}.css
    └── tests/
        ├── e2e/{gtm,navigation,seo,sharing,visual}.spec.ts
        ├── e2e/visual.spec.ts-snapshots/*
        ├── fixtures/site-snapshot.json
        └── integration/build.test.ts
```

## Task 1: Pin the monorepo and toolchain

**Files:**

- Create: `.editorconfig`, `.gitignore`, `.nvmrc`, `package.json`, `pnpm-workspace.yaml`
- Create: `web/package.json`, `web/tsconfig.json`, `studio/package.json`, `studio/tsconfig.json`
- Generate: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: Node `v24.16.0`, pnpm `11.11.0`
- Produces: root scripts `dev`, `build`, `check`, `test`, `test:e2e`, `typegen`, `seed:sorouh`; isolated workspace package scripts

- [ ] Write a failing root preflight script that exits if Node is below `22.12.0`, the package manager is not pnpm, or required env names are malformed.
- [ ] Add `engines`, `packageManager: "pnpm@11.11.0"`, and workspace package scripts. Pin exact versions rather than version ranges for the application toolchain.
- [ ] Use these verified versions: `astro@7.2.1`, `typescript@6.0.3`, `sanity@6.9.2`, `@sanity/vision@6.9.2`, `react@19.2.8`, `react-dom@19.2.8`, `styled-components@6.5.2`, `@sanity/client@8.0.0`, `@sanity/image-url@2.1.1`, `groq@6.9.2`, `astro-portabletext@0.13.0`, `@portabletext/markdown@1.4.6`, `@portabletext/types@4.0.2`, `@astrojs/check@0.9.10`, `@astrojs/rss@4.0.19`, `wrangler@4.122.0`, `vitest@4.1.10`, `@playwright/test@1.62.1`, `@axe-core/playwright@4.13.0`, `schema-dts@2.0.0`, `github-slugger@2.0.0`, `cheerio@1.2.0`, `tsx@4.23.12`, `zod@4.4.3`, `prettier@3.9.6`, and `prettier-plugin-astro@0.14.1`. Pin compatible type packages (`@types/node@26.2.0`, `@types/react@19.2.18`, `@types/react-dom@19.2.4`) as verified.
- [ ] Add a dependency test that asserts `typescript` resolves to `6.0.3` and `@astrojs/check` runs successfully; this prevents an automated TypeScript 7 upgrade from silently disabling `.astro` diagnostics.
- [ ] Add `@fontsource-variable/noto-sans-arabic@5.3.0` to `web`; import only the Arabic subsets and used weights. Keep its license notice in the dependency and mention it in README.
- [ ] Add `.gitignore` entries for `.env*` except examples, `node_modules`, `dist`, `.astro`, `.sanity`, generated snapshot JSON, Playwright artifacts, and imported source media.
- [ ] Run `pnpm install --frozen-lockfile=false`, then `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm exec astro --version`, `pnpm exec sanity --version`, and `pnpm exec wrangler --version`; expect exactly the locked versions.
- [ ] Commit: `chore: scaffold pinned Astro and Sanity workspace`

## Task 2: Establish test harnesses and shared invariants

**Files:**

- Create: `web/vitest.config.ts`, `web/playwright.config.ts`
- Create: `web/src/lib/tests/invariants.test.ts`, `web/tests/fixtures/site-snapshot.json`
- Create: `studio/src/tests/schema.test.ts`

**Interfaces:**

- Consumes: Vitest, Playwright, an intentionally minimal normalized fixture
- Produces: unit, build-integration, and browser test commands used by every later task

- [ ] Write failing tests for the immutable facts: canonical origin, locale/direction, fixed API version, RSS author email, primary/backup normalized phones, and the 13 service/10 area/5 category counts.
- [ ] Create a tiny fixture containing one service, area, project, post, and video so later build tests do not require live Sanity.
- [ ] Configure Vitest for Node utilities and Playwright for Chromium mobile/desktop projects against `pnpm preview`.
- [ ] Add root `check` ordering: preflight → format check → TypeScript/Astro → schema validation/typegen diff → unit tests → build fixture → dist validation.
- [ ] Confirm `pnpm test` fails only for the not-yet-written constants, proving the harness executes.
- [ ] Commit: `test: establish project quality harness`

## Task 3: Model Sanity content and Studio navigation

**Files:**

- Create: `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/.env.example`, `studio/schema-typegen.json`
- Create: all files under `studio/src/schemaTypes/`, `studio/src/structure/`, `studio/src/components/seo-field.tsx`
- Test: `studio/src/tests/schema.test.ts`

**Interfaces:**

- Consumes: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET=production`
- Produces: document/object schemas named in the approved spec; Studio structure; schema extraction for TypeGen

- [ ] Write failing schema tests using `Schema.compile` for all document/object names, singleton duplicate prevention, required slugs, required post category/published date, required image alt, and video metadata conditions. Project validation must require title, slug, summary, work description, classification, at least one service, one city/service-area reference, result copy, and at least one image or YouTube video.
- [ ] Implement shared constants:

```ts
export const SANITY_API_VERSION = '2026-08-13' as const
export const DATASET = 'production' as const
export const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage', 'contactPage'] as const
```

- [ ] Implement the `seo` object with `metaTitle`, `metaDescription`, `shareImage`, `noIndex`, and advanced `canonicalOverride`. Do not add primary-keyword, synonyms, or meta-keywords fields.
- [ ] Implement `contentImage` with mandatory Arabic alt, `faqItem`, `cta`, `stat`, `youtubeVideo`, and constrained Portable Text with H2/H3, lists, links, images, CTA, and YouTube blocks.
- [ ] Implement all approved documents and references. `project` includes complete visitor-facing fields for classification, scope/stages, result, service, city/service area, gallery/video, share image, SEO, and related content. Put technical `redirectFrom` fields in a hidden/read-only group and keep `redirect` documents out of the ordinary client navigation.
- [ ] Implement a fixed Studio structure: settings/pages → services → areas → projects → blog/categories; expose technical redirects only in a developer-labeled section.
- [ ] Hide singleton create/delete/duplicate actions and make previews useful in Arabic.
- [ ] Read the already-created Sanity project from the authenticated account/config with `pnpm --dir studio exec sanity projects list`; verify the intended Project ID and its `production` dataset before writing local `.env`. Do not create a new Sanity project. If more than one candidate exists, stop for an explicit Project ID rather than guessing.
- [ ] Rerun schema tests and `pnpm --dir studio exec sanity schemas validate`; expect zero errors.
- [ ] Commit: `feat(studio): model Sorouh content and editing workflow`

## Task 4: Capture prior slugs without custom modification timestamps

**Files:**

- Create: `studio/src/actions/capture-slug-redirect.tsx`
- Modify: `studio/sanity.config.ts`
- Test: `studio/src/tests/slug-action.test.ts`

**Interfaces:**

- Consumes: currently published document, draft slug, document type route prefix
- Produces: deduplicated `redirectFrom[]` on successful slug change; then delegates to the standard publish operation

- [ ] Write failing pure-helper tests for unchanged slug, first change, repeated old slug, Arabic slug encoding, and type-specific route prefixes.
- [ ] Implement the pure helper first. It must output internal paths with one leading and trailing slash and reject `/`, external URLs, query strings, or fragments.
- [ ] Wrap Sanity's current standard publish action using the official Document Actions API verified at implementation time. Patch `redirectFrom` only when the previously published slug differs, then publish.
- [ ] Do not add `contentModifiedAt`, field-diff logic, or any custom last-modified action.
- [ ] Test the action against mocked `getDocument`/`patch`/`publish` flows and manually verify in local Studio.
- [ ] Commit: `feat(studio): preserve old slugs on publish`

## Task 5: Centralize GROQ, generate types, and create a deterministic build snapshot

**Files:**

- Create: `web/src/sanity/client.ts`, `web/src/sanity/queries.ts`
- Generate: `web/src/sanity/sanity.types.ts`
- Create: `web/src/lib/content/{normalize,validate,load-snapshot}.ts`
- Create: `web/scripts/prepare-build.ts`, `web/.env.example`
- Test: `web/src/lib/tests/content.test.ts`, `web/tests/fixtures/site-snapshot.json`

**Interfaces:**

- Consumes: published Sanity documents or `CONTENT_FIXTURE_PATH`
- Produces: validated `web/src/data/site-snapshot.json` used by all routes; generated query result types

- [ ] Write failing tests for: drafts excluded, `noIndex` retained for filtering, missing required singleton failure, duplicate slug failure, optional reference warning, required reference failure, incomplete project build failure, and aggregate `lastmod` omission.
- [ ] Configure the Sanity client exactly:

```ts
createClient({
  projectId,
  dataset: 'production',
  apiVersion: '2026-08-13',
  useCdn: false,
  perspective: 'published',
})
```

- [ ] Put all `defineQuery` calls in `web/src/sanity/queries.ts`, not inside `.astro` files. Fetch settings/pages, services, areas, projects, categories, posts, redirects, image metadata, references, and `_updatedAt` in one bounded build snapshot.
- [ ] Use `sanity schemas extract` followed by `sanity typegen generate`; configure TypeGen to scan the `.ts` query file and write `web/src/sanity/sanity.types.ts`.
- [ ] Normalize references into route-safe view models. Every seeded project must produce a detail route; fail normalization with the exact project `sourceKey` and missing field names when title, summary, work description, classification, service, city/service area, result copy, or media is absent.
- [ ] Make `prepare-build.ts` choose the explicit fixture only when `CONTENT_FIXTURE_PATH` is supplied; production must fail if Sanity env is missing. Write the generated snapshot atomically and never commit it.
- [ ] Run `pnpm typegen`, `pnpm --filter web test -- content.test.ts`, and a fixture `prepare-build` command.
- [ ] Commit: `feat(content): add typed published-content build snapshot`

## Task 6: Build and test URL, phone, YouTube, TOC, and redirect utilities

**Files:**

- Create: `web/src/lib/{url,phone,youtube,toc,redirects}.ts`
- Test: corresponding `web/src/lib/tests/*.test.ts`

**Interfaces:**

- Consumes: route slugs, Saudi local/international phone values, YouTube watch/short/embed URLs, Portable Text blocks, redirect records
- Produces: canonical URLs, `tel:` and `wa.me` URLs, embed IDs/URLs, stable heading IDs/TOC, validated `_redirects` text

- [ ] Write failing table tests for root/file/page canonicalization, Arabic percent encoding, accidental double slashes, and rejection of foreign canonical overrides unless explicitly enabled.
- [ ] Test Saudi phone normalization for both approved numbers and invalid length/prefix cases. `tel:` uses E.164; WhatsApp uses digits only and an encoded Arabic starter message.
- [ ] Test all four provided Shorts URLs plus standard `watch?v=`, `youtu.be`, and `/embed/`; reject playlists, non-YouTube hosts, empty IDs, and unsafe characters.
- [ ] Use `github-slugger` for repeatable Unicode heading IDs; extract H2/H3 in document order and preserve duplicates with suffixes.
- [ ] Test redirect normalization, cycles, duplicate sources, self redirects, external destinations, collisions with live routes, and forbidden host/protocol rules.
- [ ] Implement smallest pure functions until all tables pass. Example public contracts:

```ts
canonicalUrl(path: string, override?: string): URL
contactLinks(phone: string, message?: string): {tel: string; whatsapp: string}
parseYouTubeUrl(value: string): {id: string; embedUrl: string} | null
extractToc(blocks: PortableTextBlock[]): TocItem[]
buildRedirectFile(input: RedirectInput[], liveRoutes: Set<string>): string
```

- [ ] Commit: `feat(web): add tested routing and content utilities`

## Task 7: Prepare supplied brand and project media safely

**Files:**

- Copy source to ignored staging: `work/source-media/sorouh/`
- Create: `content/sorouh/asset-manifest.ts`
- Create: `content/sorouh/project-evidence.ts`, `content/sorouh/review-register.json`
- Create: `scripts/lib/build-project-drafts.ts`
- Create: `web/public/brand/*`
- Create: `web/src/components/media/{SanityImage,YouTubeEmbed}.astro`
- Test: `web/src/lib/tests/media.test.ts`, `scripts/lib/build-project-drafts.test.ts`

**Interfaces:**

- Consumes: the user-provided Windows asset folder, file/folder names, visually inspected media, the 13 services, 10 service areas, and four provided YouTube URLs
- Produces: optimized brand assets, audited asset manifest, complete `ProjectDraft[]`, private `ReviewEntry[]`, responsive Sanity image markup, and indexable YouTube iframe markup

- [ ] Copy the source folder into ignored `work/source-media/sorouh/`; do not modify the original `D:\مكتبة عبد الله\...\ملفات` tree.
- [ ] Inventory every file name, parent folder, dimensions, MIME type, hash, duplicate, local MP4, and YouTube URL text file. Produce a contact sheet and inspect every image/video visually before grouping; no asset may be silently skipped except an exact duplicate or unusable/corrupt file recorded with a reason.
- [ ] Write failing tests for the project-draft builder. It must require a unique `sourceKey`, Arabic title/summary/description/stages/result, classification, service key, area key, SEO title/description, at least one media key, and a review-register entry for every inferred city/date/result.
- [ ] Define and use these contracts so Task 10 consumes a stable output:

```ts
export interface ProjectDraft {
  sourceKey: string
  title: string
  slug: string
  summary: string
  description: string
  classification: string
  serviceKeys: string[]
  areaKey: string
  stages: string[]
  result: string
  mediaKeys: string[]
  youtubeUrl?: string
  seo: {metaTitle: string; metaDescription: string; shareMediaKey: string}
}

export interface ReviewEntry {
  sourceKey: string
  field: 'areaKey' | 'classification' | 'stages' | 'result' | 'date'
  chosenValue: string
  evidence: string[]
  confidence: 'high' | 'medium' | 'low'
}
```

- [ ] Group the media into the largest sensible set of coherent, non-duplicated projects using visual continuity, folder/file names, work type, and video matches. Generate a complete `ProjectDraft` for every group rather than a gallery-only or hidden record.
- [ ] Assign every project the best-fit service, classification, and one of the ten approved service areas. When the exact city is not explicit, choose the best editorial fit and add a `ReviewEntry`; do not expose “draft”, “assumed”, or confidence labels in public content.
- [ ] Compute all derived counts from the inventory—number of project groups, images per project, videos used, duplicates excluded—and write them into the review report. Do not invent a second set of company-wide trust statistics.
- [ ] Export logo PNG/WebP variants and a polished 1200×630 branded social fallback using the supplied identity, navy/copper palette, and approved company name; do not redraw or alter the logo. Record source hash and generated dimensions in `asset-manifest.ts`.
- [ ] Write failing component/render tests that require image `alt`, `width`, `height`, crop/hotspot URL params, `auto=format`, responsive `srcset`, eager/high-priority hero behavior, and lazy/async default behavior.
- [ ] Implement `SanityImage.astro` with `@sanity/image-url`; do not emit `fm=avif` or a format-only `<picture>`.
- [ ] Implement `YouTubeEmbed.astro` as a responsive, fixed-ratio real iframe with a static `src`, `loading="lazy"`, safe `allow`, `allowfullscreen`, and Arabic title. Keep it below the initial hero in page composition.
- [ ] Exclude local MP4 files from production assets after matching them to YouTube equivalents.
- [ ] Run the draft validator and manually compare every `mediaKey` against the contact sheet. Expect zero unassigned usable assets, zero duplicate media across unrelated projects, and zero incomplete project drafts.
- [ ] Commit: `feat(media): prepare Sorouh brand and responsive media`

## Task 8: Create a reusable design system and conversion shell

**Files:**

- Create: `web/astro.config.ts`, styles, layouts, shell/UI components listed in the file map
- Test: `web/tests/e2e/navigation.spec.ts`

**Interfaces:**

- Consumes: site settings snapshot and design tokens
- Produces: semantic RTL HTML shell, header/footer, mobile CTA bar, accessible navigation, reusable call/WhatsApp actions

- [ ] Write a failing rendered-page test for `<html lang="ar-SA" dir="rtl">`, skip link, one `main`, mobile nav keyboard operation, visible focus, and correct primary/backup contact URLs.
- [ ] Configure Astro with `output: 'static'`, `site: 'https://sorouh.site'`, and `trailingSlash: 'always'`. Do not add the Cloudflare adapter.
- [ ] Define a Premium token system for deep navy, copper/orange, warm white, charcoal, editorial display/body type scales, wide/narrow containers, asymmetric spacing, restrained radii, borders, shadows, image ratios, and section rhythm. Import the local Noto Sans Arabic variable font with `font-display: swap`.
- [ ] Build `BaseLayout` and the semantic shell with zero hydration for static pieces. Use one tiny vanilla script only for the mobile-menu state and another for copy-link later.
- [ ] Build a polished desktop header, rich footer, breadcrumbs, and fixed mobile bar with safe-area padding. Header/footer include services, areas, blog, contact, 24/7, call, and WhatsApp; all focus/hover/active states use the same visual language.
- [ ] Build reusable composition primitives—not a single repeated card grid—for editorial split sections, large-number `StatsBand`, media-led `ProjectShowcase`, service strips, process steps, quote/callout blocks, and branded geometric sections that need no photo.
- [ ] Add a design lint fixture with representative long Arabic titles, two-line buttons, tall/landscape images, and missing optional captions; the composition must remain intentional without clipped text, layout gaps, or empty wrappers.
- [ ] Add stable hooks to every contact action: boolean `data-contact`, `data-contact-type="call|whatsapp"`, and finite `data-contact-location` values. These attributes alone add no tracking, requests, or cookies and are consumed only if Task 14 enables GTM.
- [ ] Respect `prefers-reduced-motion` and meet WCAG AA contrast at token/component level.
- [ ] Run component tests and Playwright navigation tests at 360px, 430px, 768px, and 1440px. Capture shell screenshots and reject framework-default controls, repeated “card soup”, overflow, accidental blank bands, or inconsistent spacing before committing.
- [ ] Commit: `feat(web): build accessible Arabic conversion shell`

## Task 9: Implement metadata, canonical policy, and linked JSON-LD

**Files:**

- Create: `web/src/lib/seo/{metadata,jsonld}.ts`
- Create: `web/src/components/seo/{SeoHead,JsonLd}.astro`
- Modify: `web/src/layouts/BaseLayout.astro`
- Test: `web/src/lib/tests/{metadata,jsonld}.test.ts`

**Interfaces:**

- Consumes: page view model, site settings, breadcrumbs, optional video/article/service data
- Produces: title/description, robots, canonical, OG/Twitter metadata, safe `@graph` JSON-LD

- [ ] Write failing tests for unique fallback titles/descriptions, self-canonical defaults, advanced override, `noIndex`, 1200×630 share fallback, and Arabic page locale.
- [ ] Write JSON-LD tests for stable `@id` relationships among `WebSite`, `GeneralContractor`, `WebPage`, `BreadcrumbList`, `Service`, `Article`, `ImageObject`, and eligible `VideoObject`.
- [ ] Assert the company graph contains two phone numbers, 24/7 opening hours, and the ten `areaServed` values, but no `address`, `geo`, `hasMap`, `aggregateRating`, or invented `sameAs`.
- [ ] Assert `Article.author` and `publisher` both refer to شركة صروح الشرقية للمقاولات; `datePublished` uses `publishedAt`; `dateModified` uses published `_updatedAt`.
- [ ] Render ordinary metadata text through Astro `{value}` interpolation. For the JSON-LD script only, serialize the trusted graph with `JSON.stringify`, replace `<` with `\u003c`, and insert that generated string with `set:html`; never route Sanity editorial HTML through this component.
- [ ] Add visible FAQ markup first; only then attach matching FAQ schema when the questions/answers are literally rendered.
- [ ] Run all SEO unit tests and inspect one rendered JSON-LD graph with a schema validator in the later release task.
- [ ] Commit: `feat(seo): add canonical metadata and linked structured data`

## Task 10: Seed Sorouh-only structured content and original launch copy

**Files:**

- Create: all `content/sorouh/*` files
- Create: `scripts/seed-sorouh.ts`, `scripts/lib/{guard-project,import-assets,upsert-missing}.ts`
- Create: `scripts/bootstrap-client.ts`
- Test: `scripts/*.test.ts`, `scripts/content-completeness.test.ts`

**Interfaces:**

- Consumes: Sorouh project ID guard, write token/current Sanity login, audited media, `ProjectDraft[]`, private `ReviewEntry[]`, approved business facts, and the production-first inference policy
- Produces: idempotent create-missing seed containing complete Sorouh pages/projects/SEO; private review register; neutral empty-client bootstrap for future projects

- [ ] Write failing tests that reject a mismatched target project ID, prove create-missing idempotency, preserve editor changes by default, require explicit `--update` plus a printed diff, and resolve references using actual returned `_id` values through `sourceKey`.
- [ ] Write a failing completeness test that scans every visitor-visible source field and rejects empty strings/arrays, `Lorem ipsum`, `TODO`, `TBD`, `FIXME`, `سيتم الإضافة`, `اكتب`, `00+`, `example.com`, `href="#"`, placeholder asset names, missing alt/caption, or project records without all required `ProjectDraft` fields.
- [ ] Encode complete production-first content for the 13 services, 10 areas, 5 categories, four trust statistics, home/about/contact pages, FAQs, default/mid-page CTAs, SEO fields, and every generated project. Do not leave Sanity for the client to fill before the first presentation.
- [ ] Convert every Task 7 `ProjectDraft` into a full `project` document with title, slug, summary, work description, classification, services, chosen city/service area, stages, result, ordered media, video metadata when present, related content, and unique SEO. Import no “gallery-only” project.
- [ ] Preserve `content/sorouh/review-register.json` as a developer/client-review deliverable. Validate that every inferred city/date/classification/result points to a real project `sourceKey`, lists its evidence paths, and is excluded from the Sanity public query snapshot and generated HTML.
- [ ] Write five genuinely different Arabic articles, one per approved category, with direct answers, H2/H3 structure, useful checklists/tables, relevant city references only where factual, internal service/area links, midpoint CTA, final CTA, excerpt, featured image, author organization, and first-publish date. Do not reuse prose between articles or create city-keyword filler.
- [ ] Use `@portabletext/markdown` in the seed pipeline to convert reviewed Markdown bodies to Portable Text. Preserve custom CTA and YouTube objects via explicit conversion rules and test the output block shapes.
- [ ] Upload all usable approved images, reuse identical assets by hash, apply unique Arabic alt/captions, and connect each asset to its generated project/service/area. Keep YouTube as URLs/metadata; record every excluded corrupt/duplicate asset in the review register instead of silently dropping it.
- [ ] Implement `seed:sorouh` as create-missing by default with the non-secret expected Sorouh Project ID set only after reading and verifying the existing project. Abort before any write if the current target differs.
- [ ] Implement `bootstrap-client.ts` to create only empty singleton skeletons for a newly configured client. Add a test proving it imports no module from `content/sorouh`.
- [ ] Run completeness tests and dry-run output, review the exact page/project/document/asset/reference counts against the inventory, re-read and verify the already-existing Sorouh Project ID plus `production` dataset, then execute only against that verified target. There is no project-creation dependency in this task.
- [ ] Commit: `feat(content): add isolated Sorouh seed and neutral bootstrap`

## Task 11: Build all public pages from the snapshot

**Files:**

- Create: all `.astro` routes except blog detail/discovery endpoints
- Create: `web/src/layouts/ContentLayout.astro`, required cards/sections
- Test: `web/tests/integration/build.test.ts`, `web/tests/e2e/navigation.spec.ts`

**Interfaces:**

- Consumes: normalized build snapshot, route utilities, media/design/SEO components
- Produces: Premium home, about, service index/details, area index/details, complete project index/details for every generated record, contact, and 404 static HTML

- [ ] Write a failing fixture build test that expects every route type, exactly one logical H1, visible breadcrumbs on inner pages, standard CTA placement, and one complete project detail route for every project record. Fail if a visible section renders with no meaningful text/media or an empty wrapper.
- [ ] Build the home page in the approved order with varied Premium compositions: media-led hero, dual CTA, oversized four-stat band, service strip/split layouts, project case-study showcase, process, areas, about, FAQ, recent posts, and final CTA. Do not render every section as the same card grid.
- [ ] Build about/contact pages with complete production copy and branded visual treatments. Omit address, map, visible email, form, client names, ratings, and licenses; these omissions must not create blank slots. Contact exposes both numbers and 24/7 availability using call/WhatsApp only.
- [ ] Build the service index and 13 detail pages with direct answer, scope, process, quality standards, images/projects, visible FAQ, related services/areas, and CTA.
- [ ] Build the area index and 10 original area pages with complete non-template local introductions, available services, generated related projects, visible local FAQ, nearby areas, and CTA.
- [ ] Build project cards and a detail page for every generated project. Each detail page uses a project-specific hero, summary facts, classification/service/city, ordered gallery, scope/stages/result, video when available, related service/area/project links, unique SEO, and contact CTA.
- [ ] Build a helpful Arabic 404 with home/services/contact links. Confirm Cloudflare can locate `/404.html`.
- [ ] Run fixture integration build and browser navigation tests; confirm the route count exactly matches all pages plus all generated projects, with every project represented by a complete detail route.
- [ ] Commit: `feat(web): add static service area project and contact pages`

## Task 12: Implement article reading, TOC, sharing, and related content

**Files:**

- Create: `web/src/layouts/ArticleLayout.astro`
- Create: content components listed in the file map
- Create: `web/src/pages/المدونة/{index.astro,[slug].astro}`
- Test: `web/tests/e2e/sharing.spec.ts`, `web/src/lib/tests/related.test.ts`

**Interfaces:**

- Consumes: Portable Text post, category, optional areas, author organization, related-post graph
- Produces: blog index and article HTML with featured image, dates, TOC, shares, CTAs, related posts, and Article schema

- [ ] Write failing tests for author label, formatted publish/update dates, primary category, optional areas, featured image, breadcrumb, long-post TOC, no TOC for short content, midpoint/final CTA, and related-post exclusion of current/noIndex posts.
- [ ] Render Portable Text semantically through `astro-portabletext` plus explicit custom components, with stable H2/H3 IDs shared with the TOC extractor. Do not convert it to raw HTML or use `set:html`. External links use safe `rel`; internal links keep trailing slashes.
- [ ] Insert the midpoint CTA at an intentional content block marker, never by splitting arbitrary paragraphs. Always render the final CTA.
- [ ] Build WhatsApp share, X share, and copy-link actions. WhatsApp/X are ordinary links; copy uses a tiny progressive-enhancement script and Arabic success/failure status announced with `aria-live`.
- [ ] Prefer explicit related-post references, then fill remaining slots from the same category, then actual shared areas; cap and deduplicate results.
- [ ] Render `<time datetime>` for `publishedAt` and published `_updatedAt`; hide the update label when equal at day precision.
- [ ] Run article unit/browser tests with JavaScript enabled and disabled.
- [ ] Commit: `feat(blog): add Arabic articles TOC sharing and CTAs`

## Task 13: Generate sitemap index, page/video maps, RSS, robots, llms, and internal redirects

**Files:**

- Create: discovery endpoints and `web/src/lib/seo/{sitemap,rss}.ts`
- Modify: `web/scripts/prepare-build.ts`
- Generate at build: `web/public/_redirects` (ignored) and final static files in `web/dist`
- Test: `web/src/lib/tests/{sitemap,rss,redirects}.test.ts`

**Interfaces:**

- Consumes: the same validated snapshot and live-route set as page generation
- Produces: static XML/TXT files and internal 301 rules

- [ ] Write failing XML tests for correct namespaces, XML escaping, only canonical/indexable URLs, accurate per-document `_updatedAt`, omission of untrusted aggregate `lastmod`, image entries, and no `priority`/`changefreq`.
- [ ] Generate `/sitemap.xml` as an index referencing `/sitemap-pages.xml` and `/sitemap-videos.xml`.
- [ ] Generate video entries only when the visible page has a real YouTube iframe and complete matching thumbnail/title/description/date metadata. Use `https://www.youtube.com/embed/{id}` in `video:player_loc`.
- [ ] Generate RSS from indexable published posts only, with canonical links, actual dates, and excerpts. Build `customData` only from XML-escaped approved values and emit `<author>info@sorouh.site (شركة صروح الشرقية للمقاولات)</author>` because RSS 2.0 defines `author` as an email address; keep the organization name in parentheses. Do not accept editorial HTML, drafts, or future posts.
- [ ] Generate permissive robots text exactly around `User-agent: *`, `Allow: /`, and the sitemap URL. Do not name or block individual AI bots.
- [ ] Generate concise `llms.txt` with company facts and canonical links, clearly treating it as discovery support rather than a ranking claim.
- [ ] Generate `_redirects` before Astro copies `public/` into `dist`; include collected `redirectFrom[]` and developer redirect records as `301`, and test that no HTTP/HTTPS or `www` rule appears.
- [ ] Parse every output file in tests and verify every sitemap/RSS URL maps to an actual generated file or canonical public endpoint.
- [ ] Commit: `feat(seo): generate static discovery and internal redirect files`

## Task 14: Add optional Google Tag Manager support

**Files:**

- Create: `web/src/lib/analytics/gtm.ts`
- Create: `web/src/components/analytics/GoogleTagManager.astro`
- Modify: `web/src/layouts/BaseLayout.astro`, `web/.env.example`
- Test: `web/src/lib/tests/gtm.test.ts`, `web/tests/e2e/gtm.spec.ts`

**Interfaces:**

- Consumes: optional build-time `PUBLIC_GTM_ID`, existing `data-contact` attributes
- Produces: `parseGtmId(value: string | undefined): string | null`, one official head snippet, one body `noscript`, and non-personal `contact_click` dataLayer events

- [ ] Write failing unit tests for an absent/blank variable returning `null`, valid uppercase `GTM-ABCDEFG` values, and rejection of `G-`, `AW-`, whitespace, quotes, URL fragments, or arbitrary JavaScript.
- [ ] Write a failing fixture-build test with no ID that asserts `gtm.js`, `ns.html`, `dataLayer`, and Google Tag Manager markup are completely absent from every generated page.
- [ ] Implement `parseGtmId` with the exact allowlist `/^GTM-[A-Z0-9]+$/`; throw a build-stopping error naming `PUBLIC_GTM_ID` when a non-empty value is invalid:

```ts
export function parseGtmId(value: string | undefined): string | null {
  if (value === undefined || value === '') return null
  if (!/^GTM-[A-Z0-9]+$/.test(value)) {
    throw new Error('PUBLIC_GTM_ID must match GTM-[A-Z0-9]+')
  }
  return value
}
```

- [ ] Implement `GoogleTagManager.astro` with a required `placement: 'head' | 'body'` prop. Use it once immediately inside `<head>` for Google's official loader and once immediately inside `<body>` for the official zero-size `noscript` iframe plus the contact listener. Pass the parsed ID through Astro variables/attributes; do not use `set:html` or accept Sanity content.
- [ ] Add a delegated click listener only when GTM is enabled. For elements with `data-contact`, push exactly this non-personal shape and never include `href`, phone, page copy, or user input:

```ts
window.dataLayer?.push({
  event: 'contact_click',
  contact_type: element.dataset.contactType,
  contact_location: element.dataset.contactLocation,
})
```

- [ ] Standardize contact elements to `data-contact`, `data-contact-type="call|whatsapp"`, and a finite `data-contact-location` value such as `header`, `mobile_bar`, `article_mid`, or `article_end`.
- [ ] Add `PUBLIC_GTM_ID=` to `.env.example` with an Arabic note that blank means disabled and the ID is technical build configuration, not a Sanity field or secret.
- [ ] Build once without the variable and once with a fixture `GTM-ABCDEFG`; assert zero markup when disabled, exactly one loader/iframe per page when enabled, and the documented event object on call/WhatsApp clicks. In Playwright, intercept `**/*googletagmanager.com/**` and prove the disabled build makes no matching request.
- [ ] Commit: `feat(analytics): add optional Google Tag Manager support`

## Task 15: Configure Cloudflare static delivery and cache headers

**Files:**

- Create: `web/wrangler.jsonc`, `web/public/_headers`
- Modify: `web/astro.config.ts`, `web/package.json`
- Test: `web/src/lib/tests/config.test.ts`, `web/scripts/validate-dist.ts`

**Interfaces:**

- Consumes: Astro static `dist`
- Produces: Workers Static Assets config, cache/minimal static headers, deployment-ready build

- [ ] Write failing config tests for no `main`, `workers_dev: false`, `preview_urls: true`, asset directory, trailing-slash handling, and 404 behavior.
- [ ] Use the current Wrangler JSON schema and this minimum shape:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "sorouh-site",
  "compatibility_date": "2026-08-13",
  "workers_dev": false,
  "preview_urls": true,
  "assets": {
    "directory": "./dist",
    "html_handling": "force-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

- [ ] Add one `/*` rule in `_headers` with `Cache-Control: public, max-age=0, must-revalidate`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`; override `/_astro/*` with `Cache-Control: public, max-age=31536000, immutable`. Do not add other browser policy headers or per-provider allowlists.
- [ ] Make `validate-dist.ts` reject missing files, noncanonical internal links, duplicate canonicals, leaked secrets, missing cache/minimal headers, accidental MP4 output, and unexpected external origins. Permit `www.googletagmanager.com` only in the GTM-enabled test build.
- [ ] Run `pnpm --filter web build` with fixture data, then `pnpm --dir web exec wrangler deploy --dry-run`; expect a static-assets-only bundle and no Worker entry module.
- [ ] Commit: `feat(cloudflare): configure static asset delivery and caching`

## Task 16: Complete automated SEO, accessibility, and browser gates

**Files:**

- Create/extend: `web/scripts/validate-dist.ts`, `web/tests/integration/build.test.ts`, all `web/tests/e2e/*.spec.ts`
- Create: `web/tests/e2e/visual.spec.ts`, `web/tests/e2e/visual.spec.ts-snapshots/*`
- Modify: root/package scripts and README quality commands

**Interfaces:**

- Consumes: a complete fixture build and later the live Sanity build
- Produces: a repeatable release gate with explicit pass/fail evidence

- [ ] Add static HTML assertions with Cheerio: unique title/description/canonical, one H1, `lang`/`dir`, heading order, image alt/dimensions, iframe dimensions/title/src/loading, breadcrumbs, telephone links, and JSON-LD parseability.
- [ ] Add production-output completeness assertions across every HTML file: no visitor-visible placeholder phrase, editor instruction, `00+`, placeholder filename, empty heading/paragraph/CTA, `href="#"`, empty section, broken image, or project page missing classification/service/city/stages/result/gallery. Confirm no text from `review-register.json` appears in `dist`.
- [ ] Crawl all internal `<a href>` targets in `dist`; account for trailing-slash HTML resolution and verify 404 plus `_redirects` destinations/cycles.
- [ ] Add Playwright coverage for desktop/mobile header, keyboard nav, sticky contact bar, call/WhatsApp links, share links, clipboard success/fallback, and 404 recovery.
- [ ] Add a route-matrix visual test at 360×800, 430×932, 768×1024, and 1440×1000. For every page type, assert `document.documentElement.scrollWidth === innerWidth`, no visible zero-height section, no image with `naturalWidth === 0`, no clipped CTA, and no overlapping fixed mobile bar.
- [ ] Commit deterministic `toHaveScreenshot({fullPage: true})` baselines for home, one service, one area, one project, one article, and contact at 390×844 and 1440×1000. Review baselines manually for custom Premium art direction, varied section composition, consistent type/spacing, intentional image crops, polished states, and absence of framework-default controls/card soup before accepting snapshots.
- [ ] Run axe on home, one service, one area, one generated project, one article, and contact; allow no serious or critical violations and document any lower-impact exception with a specific issue.
- [ ] Add a no-JavaScript crawl proving core copy, links, YouTube iframe, metadata, breadcrumbs, and CTAs remain present.
- [ ] Run `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`; capture exact output and the visual route matrix in the implementation log. A green build without completed visual review does not pass this task.
- [ ] Commit: `test: enforce SEO accessibility and static build gates`

## Task 17: Document reuse, editing, deployment, and rollback

**Files:**

- Create/modify: `README.md`
- Create: `docs/editor-guide-ar.md`, `docs/deployment-runbook.md`, `docs/new-client-checklist.md`, `docs/release-checklist.md`, `docs/visual-review.md`

**Interfaces:**

- Consumes: final commands, content model, external configuration requirements
- Produces: handoff documentation for developer and Arabic editor

- [ ] Document local setup, env variables, content pull, TypeGen, tests, build, Studio dev/deploy, Worker dev/deploy, and rollback.
- [ ] Document optional GTM activation through `PUBLIC_GTM_ID`, Cloudflare Builds configuration, validation failure behavior, supported contact event fields, disabled-by-default output, and the need to assess requirements separately before adding tags that create cookies or collect personal data.
- [ ] Document exactly what the client may edit: phones/WhatsApp, CTA text, images, projects, services, areas, posts/categories, and safe SEO fields. Explain advanced canonical/noIndex warnings and keep redirects developer-only.
- [ ] Document the private `content/sorouh/review-register.json` workflow: filter low-confidence entries, review city/classification/stages/result with the client, apply confirmed corrections via the explicit seed update flow or Studio, and remove resolved entries without exposing the register publicly.
- [ ] Add `docs/visual-review.md` with the approved Premium criteria and a signed route/viewport matrix for home, service, area, project, article, contact, and 404. Include links to the Playwright screenshot artifacts used for the final review.
- [ ] Document the new-client flow: new private repo, separate Sanity project plus `production` dataset, identity/domain config, original content import, new Studio hostname, new Worker, and no copying of `content/sorouh`.
- [ ] Add a machine-verifiable test that `bootstrap-client.ts` and reusable `web/studio` modules contain no Sorouh phone, company name, article prose, project assets, or expected Sorouh project ID except through client config/content injection.
- [ ] Document external Cloudflare settings: custom domain, Always Use HTTPS, `www` proxied DNS plus Bulk Redirect preserving path/query, public preview URLs, optional GTM build variable, deploy hook, Crawler Hints, Search Console, and Bing.
- [ ] Commit: `docs: add editor deployment and starter handoff guides`

## Task 18: Connect the existing isolated services and deploy production

**Files:**

- Modify only with non-secret IDs: `studio/.env.example`, `web/.env.example`, `scripts/lib/guard-project.ts`, deployment docs
- Do not commit: actual `.env` files, tokens, hook URLs

**Interfaces:**

- Consumes: existing authenticated GitHub, Sanity, and Cloudflare sessions; `sorouh.site` zone
- Produces: private GitHub repo, verified existing independent Sanity project/dataset/Studio, public Workers previews, and production site

- [ ] Preflight read-only auth and ownership: `gh auth status`, `pnpm --dir studio exec sanity projects list`, `pnpm --dir web exec wrangler whoami`, and Cloudflare zone/domain inspection. Stop before mutation if the signed-in account cannot own the deliverables.
- [ ] Read and verify the already-created Sorouh Sanity Project ID and `production` dataset. Record only the non-secret Project ID/dataset in configuration, configure allowed CORS origins for local Studio and the deployed Studio/site, and never create or select a different client's project.
- [ ] Run `sanity schemas validate`, `sanity schemas extract`, `sanity schemas deploy`, and `sanity typegen generate`. Confirm Task 10 already seeded the verified Project ID, then rerun seed in dry-run/create-missing mode to prove idempotency and confirm document counts, links, images, and `_updatedAt` behavior without rewriting editor changes.
- [ ] Deploy Studio with `pnpm --dir studio exec sanity deploy`, choosing a unique Sorouh hostname. Verify client login and restricted navigation.
- [ ] Build from live published Sanity and run the entire release gate. Inspect representative output manually before publishing.
- [ ] Compare the live-content document/project/media counts with the audited inventory and `ProjectDraft[]`. Stop deployment if any usable project group is missing, any public project lacks a detail route, or any review-register entry references a missing source key.
- [ ] Run the Premium visual matrix against the live-content build, not only the fixture. Review the final Arabic copy, image crops, project galleries, mobile sticky bar, and all empty-state boundaries before publishing.
- [ ] Keep `PUBLIC_GTM_ID` unset for the initial production deployment unless the owner supplies an approved container ID. Verify the deployed HTML contains no GTM loader/iframe while unset; later activation requires only the Cloudflare Builds variable and a rebuild.
- [ ] Create the private GitHub repository only after confirming the intended owner: `gh repo create sorouh-site --private --source=. --remote=origin --push`. If the name exists, stop and resolve ownership/name rather than overwriting.
- [ ] Create/deploy `sorouh-site` using `pnpm --dir web exec wrangler deploy`; connect Workers Builds to `main`, add the custom domain, and store the Sanity deploy-hook secret only in Sanity/Cloudflare settings.
- [ ] Enable and smoke-test public branch/version Preview URLs. Confirm they render correctly as public previews.
- [ ] Enable Always Use HTTPS. Add proxied `www` DNS and a 301 Bulk Redirect from `www.sorouh.site` to apex with subpath/query preservation. Enable Crawler Hints. Keep these rules out of `_redirects`.
- [ ] Test the live URL matrix: HTTP, HTTPS, `www`, apex, missing/present trailing slash, `.html`, query preservation, 404, internal old slug, and no redirect loops.
- [ ] Verify the webhook by publishing a harmless reviewed content change, observing Workers Build, and confirming the new published `_updatedAt` reaches Article `dateModified`/eligible sitemap `lastmod` while draft-only edits do not.
- [ ] Add Search Console and Bing verification, submit `https://sorouh.site/sitemap.xml`, and verify robots/RSS/video sitemap are fetchable. Do not claim indexing or ranking immediately.
- [ ] Commit any final non-secret deployment identifiers/docs: `chore: document Sorouh production deployment`

## Task 19: Final review and delivery

**Files:**

- Review: all tracked files and generated live output
- Update: `docs/release-checklist.md`

**Interfaces:**

- Consumes: completed repository, Sanity content, Cloudflare production, GitHub private repo
- Produces: evidence-backed delivery with no placeholders or leaked secrets

- [ ] Run a source and built-output placeholder scan for `TODO|TBD|FIXME|example\.com|lorem|YOUR_|CHANGE_ME|سيتم الإضافة|اكتب وصف|00\+|placeholder|href="#"`; resolve every production hit and allow only the explicit negative-test fixtures that assert these values are rejected.
- [ ] Run a secret/media scan for tokens, hook URLs, `.env`, local source paths, MP4, and accidental client cross-contamination.
- [ ] Run a type-consistency audit: schema extraction → TypeGen → `git diff --exit-code web/src/sanity/sanity.types.ts`; then `pnpm check`, all tests, live-content build, dist validation, and Wrangler dry run.
- [ ] Use the `superpowers:requesting-code-review` skill for an independent requirements/code review, address verified findings, then rerun the full gate.
- [ ] Run `superpowers:verification-before-completion`; record the fresh command outputs, production URLs, deployment IDs, and known non-blocking limitations.
- [ ] Verify every approved requirement from the design spec has either an implementation reference or an explicit accepted non-build decision.
- [ ] Review every entry in `content/sorouh/review-register.json` against its evidence and confirm it is deliverable, linked to an existing record, and absent from public output. Deliver it as the fast client-correction checklist rather than leaving incomplete website fields.
- [ ] Repeat the full-page Premium screenshot review after the final live deployment at 390px and 1440px; reject any production-only regression, missing media, empty band, generic/default styling, or inconsistent project page.
- [ ] Deliver the private repo, production URL, Sanity Studio URL, editor guide, deployment/rollback runbook, and external-setting checklist. Report actual outcomes only; never promise a specific search ranking.
- [ ] Commit: `chore: finalize Sorouh production handoff`

## Execution Checkpoints

- **Checkpoint A — Foundation:** Tasks 1–6 pass unit/type/schema tests before visual work.
- **Checkpoint B — Content and UI:** Tasks 7–12 pass fixture build and browser tests before cloud mutation.
- **Checkpoint C — Static delivery:** Tasks 13–17 pass the GTM-disabled/enabled builds and full offline release gate before production deployment.
- **Checkpoint D — Production:** Tasks 18–19 validate live redirects, public previews, publish webhook, discovery files, and handoff ownership.

## Definition of Done

- `pnpm check`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, live-content dist validation, and Wrangler dry-run all pass from a clean checkout.
- The generated site contains every approved page, five original Sorouh articles, every coherent project inferred from the supplied media, build-time discovery files, accurate canonical/lastmod behavior, and visible real YouTube iframes. All inferred project facts are complete in public content and traceable in the private review register; no unprovided client names, ratings, licenses, registrations, or third-party identities are present.
- Every public page passes the Premium visual review at mobile and desktop sizes and contains no placeholder, empty visible field, missing project detail route, broken media, default framework styling, or repeated card-only composition.
- A clean build with no `PUBLIC_GTM_ID` contains no GTM markup or requests; a build with a valid ID contains one official installation per page and emits only the documented non-personal contact events.
- `sorouh.site` serves the Cloudflare Workers Static Assets deployment; protocol/host/trailing-slash behavior is canonical and loop-free; public previews behave as configured.
- Sorouh's existing independent Sanity project is verified with its `production` dataset and hosted Studio, plus a private GitHub repository and documented rollback.
- The reusable starter contains structure and automation only; Sorouh-specific content remains isolated under `content/sorouh` and is excluded from future-client bootstrap.
