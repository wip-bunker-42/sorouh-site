# Sorouh Contractor Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Build, populate, verify, and deploy the Arabic-only Sorouh contractor website and its Sanity Studio as an isolated, reusable code starter, with static-first SEO/AEO and Cloudflare Workers Static Assets hosting.

**Architecture:** A small pnpm monorepo contains `web/` (Astro 7 SSG), `studio/` (Sanity 6 Studio), `scripts/` (client bootstrap and import utilities), and `content/sorouh/` (Sorouh-only seed content). A prebuild content snapshot fetches only published Sanity data once, validates it, generates internal redirects, and feeds every Astro route and static discovery file consistently. The public site has no runtime Worker or SSR; Cloudflare serves `web/dist` as Static Assets and enforces trailing-slash URLs.

**Tech Stack:** Node.js 24, pnpm 11, Astro 7.2.1, TypeScript 7.0.2 strict, Sanity 6.9.2, `@sanity/client` 8.0.0, GROQ 6.9.2, Sanity TypeGen, Portable Text, Wrangler 4.122.0, Vitest 4.1.10, `@playwright/test` 1.62.1, axe-core, and Cloudflare Workers Static Assets.

**Spec:** `docs/superpowers/specs/2026-08-13-sorouh-contractor-website-design.md`

## Global Constraints

- Keep all visible copy Arabic (`ar-SA`, RTL) in a professional Saudi voice. Never invent an address, email, license, rating, review, staff name, guarantee, or Google Business Profile.
- The primary call/WhatsApp number is `0546121683` (`+966546121683`); the backup is `0546745928` (`+966546745928`). Both are available 24/7.
- Use the provided logo, project media, and four YouTube URLs. Do not ship local MP4 files when the equivalent YouTube video exists.
- Every public URL ends in `/`, except actual files such as `.xml`, `.txt`, and `/404.html`. Canonicals always use `https://sorouh.site` unless a reviewed `canonicalOverride` exists.
- Sitemaps, RSS, robots, llms, JSON-LD, HTML, and `_redirects` are build-time output. There is no runtime content endpoint.
- `publishedAt` is the initial article publish date. A published document's `_updatedAt` is `dateModified` and eligible `lastmod`; omit `lastmod` when it would not accurately represent the rendered aggregate page.
- The Sanity API version is exactly `2026-08-13`; never derive it from the current date. Production builds use `useCdn: false` and the published perspective.
- Sanity image URLs use `auto=format`, explicit width/height, crop/hotspot, and responsive `srcset`; do not request `fm=avif`.
- YouTube embeds must be real `<iframe src>` elements in generated HTML with `loading="lazy"`; do not use click-to-load.
- `_redirects` contains internal path/slug redirects only. Cloudflare Always Use HTTPS and Bulk Redirect handle protocol and `www` canonicalization.
- `workers_dev` is false. Preview URLs are permitted only after Cloudflare Access protects them.
- The general starter contains schemas, components, generators, tests, and empty singleton bootstrap only. It never contains Sorouh copy, services, areas, images, or SEO articles.
- Use test-driven development for behavior. Run the narrow failing test first, implement the smallest change, rerun it, then run the relevant wider checks before committing.
- Before each external CLI mutation, inspect the current official CLI help (`pnpm exec sanity ... --help`, `pnpm exec wrangler ... --help`, or `gh ... --help`) and preserve the verified output in the implementation log.
- Never commit `.env`, tokens, deploy-hook URLs, Sanity write tokens, Cloudflare credentials, generated content snapshots, imported source MP4s, or production secrets.

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
│       ├── projects.ts
│       ├── service-areas.ts
│       ├── services.ts
│       ├── site-settings.ts
│       └── posts/*.ts
├── scripts/
│   ├── bootstrap-client.ts
│   ├── preflight.ts
│   ├── seed-sorouh.ts
│   └── lib/{guard-project.ts,import-assets.ts,upsert-missing.ts}
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
    │   │   ├── content/{ArticleCta,PortableContent,RelatedPosts,ShareButtons,TableOfContents}.astro
    │   │   ├── media/{SanityImage,YouTubeEmbed}.astro
    │   │   ├── seo/{JsonLd,SeoHead}.astro
    │   │   ├── shell/{Breadcrumbs,Footer,Header,MobileActions,SkipLink}.astro
    │   │   └── ui/{CallButton,CardGrid,SectionHeading,WhatsAppButton}.astro
    │   ├── data/.gitkeep
    │   ├── layouts/{ArticleLayout,BaseLayout,ContentLayout}.astro
    │   ├── lib/
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
        ├── e2e/{navigation,seo,sharing}.spec.ts
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
- [ ] Use these verified versions: `astro@7.2.1`, `typescript@7.0.2`, `sanity@6.9.2`, `@sanity/vision@6.9.2`, `react@19.2.8`, `react-dom@19.2.8`, `styled-components@6.5.2`, `@sanity/client@8.0.0`, `@sanity/image-url@2.1.1`, `groq@6.9.2`, `astro-portabletext@0.13.0`, `@portabletext/markdown@1.4.6`, `@portabletext/types@4.0.2`, `@astrojs/check@0.9.10`, `@astrojs/rss@4.0.19`, `wrangler@4.122.0`, `vitest@4.1.10`, `@playwright/test@1.62.1`, `@axe-core/playwright@4.13.0`, `schema-dts@2.0.0`, `github-slugger@2.0.0`, `cheerio@1.2.0`, `tsx@4.23.12`, `zod@4.4.3`, `prettier@3.9.6`, and `prettier-plugin-astro@0.14.1`. Pin compatible type packages (`@types/node@26.2.0`, `@types/react@19.2.18`, `@types/react-dom@19.2.4`) as verified.
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

- [ ] Write failing tests for the immutable facts: canonical origin, locale/direction, fixed API version, primary/backup normalized phones, and the 13 service/10 area/5 category counts.
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

- [ ] Write failing schema tests using `Schema.compile` for all document/object names, singleton duplicate prevention, required slugs, required post category/published date, required image alt, and video metadata conditions.
- [ ] Implement shared constants:

```ts
export const SANITY_API_VERSION = '2026-08-13' as const
export const DATASET = 'production' as const
export const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage', 'contactPage'] as const
```

- [ ] Implement the `seo` object with `metaTitle`, `metaDescription`, `shareImage`, `noIndex`, and advanced `canonicalOverride`. Do not add primary-keyword, synonyms, or meta-keywords fields.
- [ ] Implement `contentImage` with mandatory Arabic alt, `faqItem`, `cta`, `stat`, `youtubeVideo`, and constrained Portable Text with H2/H3, lists, links, images, CTA, and YouTube blocks.
- [ ] Implement all approved documents and references. Put technical `redirectFrom` fields in a hidden/read-only group and keep `redirect` documents out of the ordinary client navigation.
- [ ] Implement a fixed Studio structure: settings/pages → services → areas → projects → blog/categories; expose technical redirects only in a developer-labeled section.
- [ ] Hide singleton create/delete/duplicate actions and make previews useful in Arabic.
- [ ] Rerun schema tests and `pnpm --dir studio exec sanity schema validate`; expect zero errors.
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

- [ ] Write failing tests for: drafts excluded, `noIndex` retained for filtering, missing required singleton failure, duplicate slug failure, optional reference warning, required reference failure, thin project page demotion, and aggregate `lastmod` omission.
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
- [ ] Use `sanity schema extract` followed by `sanity typegen generate`; configure TypeGen to scan the `.ts` query file and write `web/src/sanity/sanity.types.ts`.
- [ ] Normalize references into route-safe view models. Mark project detail eligibility only when title, unique summary/description, service, area, and at least one image/video exist.
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
- Create: `web/public/brand/*`
- Create: `web/src/components/media/{SanityImage,YouTubeEmbed}.astro`
- Test: `web/src/lib/tests/media.test.ts`

**Interfaces:**

- Consumes: the user-provided Windows asset folder and four provided YouTube URLs
- Produces: optimized brand assets, audited asset manifest, responsive Sanity image markup, indexable YouTube iframe markup

- [ ] Copy the source folder into ignored `work/source-media/sorouh/`; do not modify the original `D:\مكتبة عبد الله\...\ملفات` tree.
- [ ] Inventory file names, dimensions, MIME types, hashes, duplicates, and YouTube URL text files. Inspect every image visually before assigning it to a project/service/area.
- [ ] Export logo PNG/WebP variants and a simple social fallback using the supplied identity; do not redraw or alter the brand. Record source hash and generated dimensions in `asset-manifest.ts`.
- [ ] Write failing component/render tests that require image `alt`, `width`, `height`, crop/hotspot URL params, `auto=format`, responsive `srcset`, eager/high-priority hero behavior, and lazy/async default behavior.
- [ ] Implement `SanityImage.astro` with `@sanity/image-url`; do not emit `fm=avif` or a format-only `<picture>`.
- [ ] Implement `YouTubeEmbed.astro` as a responsive, fixed-ratio real iframe with a static `src`, `loading="lazy"`, safe `allow`, `allowfullscreen`, and Arabic title. Keep it below the initial hero in page composition.
- [ ] Exclude local MP4 files from production assets after matching them to YouTube equivalents.
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
- [ ] Define CSS custom properties for navy, copper/orange, white, charcoal, spacing, typography, radii, shadows, and container sizes. Import the local Noto Sans Arabic variable font with `font-display: swap`.
- [ ] Build `BaseLayout` and the semantic shell with zero hydration for static pieces. Use one tiny vanilla script only for the mobile-menu state and another for copy-link later.
- [ ] Build a desktop header, rich footer, breadcrumbs, and fixed mobile bar with safe-area padding. Header/footer include services, areas, blog, contact, 24/7, call, and WhatsApp.
- [ ] Add stable analytics hooks such as `data-contact="call-primary"` and `data-contact="whatsapp-primary"`, without adding analytics or cookies.
- [ ] Respect `prefers-reduced-motion` and meet WCAG AA contrast at token/component level.
- [ ] Run component tests and Playwright navigation tests at mobile and desktop widths.
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
- [ ] Emit JSON-LD with `<` escaped as `\u003c` before insertion into the script element.
- [ ] Add visible FAQ markup first; only then attach matching FAQ schema when the questions/answers are literally rendered.
- [ ] Run all SEO unit tests and inspect one rendered JSON-LD graph with a schema validator in the later release task.
- [ ] Commit: `feat(seo): add canonical metadata and linked structured data`

## Task 10: Seed Sorouh-only structured content and original launch copy

**Files:**

- Create: all `content/sorouh/*` files
- Create: `scripts/seed-sorouh.ts`, `scripts/lib/{guard-project,import-assets,upsert-missing}.ts`
- Create: `scripts/bootstrap-client.ts`
- Test: `scripts/*.test.ts`

**Interfaces:**

- Consumes: Sorouh project ID guard, write token/current Sanity login, audited media, approved business facts
- Produces: idempotent create-missing seed for Sorouh; neutral empty-client bootstrap for future projects

- [ ] Write failing tests that reject a mismatched target project ID, prove create-missing idempotency, preserve editor changes by default, require explicit `--update` plus a printed diff, and resolve references using actual returned `_id` values through `sourceKey`.
- [ ] Encode the 13 services, 10 areas, 5 categories, four trust statistics, pages, phone settings, FAQs, and project records as Sorouh-only source modules.
- [ ] Write five genuinely different Arabic articles, one per approved category, with direct answers, H2/H3 structure, useful checklists/tables, relevant city references only where factual, internal service/area links, midpoint CTA, final CTA, excerpt, featured image, author organization, and first-publish date. Do not reuse prose between articles or create city-keyword filler.
- [ ] Use `@portabletext/markdown` in the seed pipeline to convert reviewed Markdown bodies to Portable Text. Preserve custom CTA and YouTube objects via explicit conversion rules and test the output block shapes.
- [ ] Upload only approved images, reuse identical assets by hash, apply alt/captions, and connect each asset to its real project/service/area. Keep YouTube as URLs/metadata.
- [ ] Implement `seed:sorouh` as create-missing by default with a hardcoded non-secret expected Sorouh project ID set only after project creation. Abort before any write if the current target differs.
- [ ] Implement `bootstrap-client.ts` to create only empty singleton skeletons for a newly configured client. Add a test proving it imports no module from `content/sorouh`.
- [ ] Run dry-run output, review the document/asset/reference counts, then execute against the Sorouh `production` dataset only after Task 15 creates the project.
- [ ] Commit: `feat(content): add isolated Sorouh seed and neutral bootstrap`

## Task 11: Build all public pages from the snapshot

**Files:**

- Create: all `.astro` routes except blog detail/discovery endpoints
- Create: `web/src/layouts/ContentLayout.astro`, required cards/sections
- Test: `web/tests/integration/build.test.ts`, `web/tests/e2e/navigation.spec.ts`

**Interfaces:**

- Consumes: normalized build snapshot, route utilities, media/design/SEO components
- Produces: home, about, service index/details, area index/details, project index/eligible details, contact, and 404 static HTML

- [ ] Write a failing fixture build test that expects every route type, exactly one logical H1, visible breadcrumbs on inner pages, standard CTA placement, and no thin project route.
- [ ] Build the home page sections in the approved order: direct hero, dual CTA, four trust stats, selected services, real projects, process, areas, about, FAQ, recent posts, final CTA.
- [ ] Build about/contact pages without address, map, email, form, or fabricated claims. Contact exposes both numbers and 24/7 availability using call/WhatsApp only.
- [ ] Build the service index and 13 detail pages with direct answer, scope, process, quality standards, images/projects, visible FAQ, related services/areas, and CTA.
- [ ] Build the area index and 10 original area pages with non-template local introductions, available services, actual projects where present, visible local FAQ, nearby areas, and CTA.
- [ ] Build project cards for all valid records, but generate detail pages only for records that satisfy the eligibility validator.
- [ ] Build a helpful Arabic 404 with home/services/contact links. Confirm Cloudflare can locate `/404.html`.
- [ ] Run fixture integration build and browser navigation tests.
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
- [ ] Render Portable Text semantically with stable H2/H3 IDs shared with the TOC extractor. External links use safe `rel`; internal links keep trailing slashes.
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
- [ ] Generate RSS from indexable published posts only, with canonical links, actual dates, excerpts, and organization author. Do not include drafts or future posts.
- [ ] Generate permissive robots text exactly around `User-agent: *`, `Allow: /`, and the sitemap URL. Do not name or block individual AI bots.
- [ ] Generate concise `llms.txt` with company facts and canonical links, clearly treating it as discovery support rather than a ranking claim.
- [ ] Generate `_redirects` before Astro copies `public/` into `dist`; include collected `redirectFrom[]` and developer redirect records as `301`, and test that no HTTP/HTTPS or `www` rule appears.
- [ ] Parse every output file in tests and verify every sitemap/RSS URL maps to an actual generated file or canonical public endpoint.
- [ ] Commit: `feat(seo): generate static discovery and internal redirect files`

## Task 14: Configure Cloudflare static delivery, CSP, and cache/security headers

**Files:**

- Create: `web/wrangler.jsonc`, `web/public/_headers`
- Modify: `web/astro.config.ts`, `web/package.json`
- Test: `web/src/lib/tests/config.test.ts`, `web/scripts/validate-dist.ts`

**Interfaces:**

- Consumes: Astro static `dist`, Sanity image hosts, YouTube iframe hosts
- Produces: Workers Static Assets config, Astro CSP, static response headers, deployment-ready build

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

- [ ] Configure Astro's built-in CSP to allow only self, Sanity CDN images, YouTube embeds/thumbnails, and the minimum hashed inline output; prohibit `unsafe-eval` and avoid `unsafe-inline` unless an official Astro limitation is reproduced and documented.
- [ ] Add `_headers` for `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, appropriate frame policy compatible with YouTube embedding, long immutable cache for hashed assets/fonts, and short revalidation for HTML/XML/TXT.
- [ ] Make `validate-dist.ts` reject missing files, noncanonical internal links, duplicate canonicals, unexpected origins, secrets, missing CSP/security headers, and accidental MP4 output.
- [ ] Run `pnpm --filter web build` with fixture data, then `pnpm --dir web exec wrangler deploy --dry-run`; expect a static-assets-only bundle and no Worker entry module.
- [ ] Commit: `feat(cloudflare): configure secure static asset delivery`

## Task 15: Complete automated SEO, accessibility, and browser gates

**Files:**

- Create/extend: `web/scripts/validate-dist.ts`, `web/tests/integration/build.test.ts`, all `web/tests/e2e/*.spec.ts`
- Modify: root/package scripts and README quality commands

**Interfaces:**

- Consumes: a complete fixture build and later the live Sanity build
- Produces: a repeatable release gate with explicit pass/fail evidence

- [ ] Add static HTML assertions with Cheerio: unique title/description/canonical, one H1, `lang`/`dir`, heading order, image alt/dimensions, iframe dimensions/title/src/loading, breadcrumbs, telephone links, and JSON-LD parseability.
- [ ] Crawl all internal `<a href>` targets in `dist`; account for trailing-slash HTML resolution and verify 404 plus `_redirects` destinations/cycles.
- [ ] Add Playwright coverage for desktop/mobile header, keyboard nav, sticky contact bar, call/WhatsApp links, share links, clipboard success/fallback, and 404 recovery.
- [ ] Run axe on home, one service, one area, one eligible project, one article, and contact; allow no serious or critical violations and document any lower-impact exception with a specific issue.
- [ ] Add a no-JavaScript crawl proving core copy, links, YouTube iframe, metadata, breadcrumbs, and CTAs remain present.
- [ ] Run `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`; capture exact output in the implementation log.
- [ ] Commit: `test: enforce SEO accessibility and static build gates`

## Task 16: Document reuse, editing, deployment, and rollback

**Files:**

- Create/modify: `README.md`
- Create: `docs/editor-guide-ar.md`, `docs/deployment-runbook.md`, `docs/new-client-checklist.md`, `docs/release-checklist.md`

**Interfaces:**

- Consumes: final commands, content model, external configuration requirements
- Produces: handoff documentation for developer and Arabic editor

- [ ] Document local setup, env variables, content pull, TypeGen, tests, build, Studio dev/deploy, Worker dev/deploy, and rollback.
- [ ] Document exactly what the client may edit: phones/WhatsApp, CTA text, images, projects, services, areas, posts/categories, and safe SEO fields. Explain advanced canonical/noIndex warnings and keep redirects developer-only.
- [ ] Document the new-client flow: new private repo, separate Sanity project plus `production` dataset, identity/domain config, original content import, new Studio hostname, new Worker, and no copying of `content/sorouh`.
- [ ] Add a machine-verifiable test that `bootstrap-client.ts` and reusable `web/studio` modules contain no Sorouh phone, company name, article prose, project assets, or expected Sorouh project ID except through client config/content injection.
- [ ] Document external Cloudflare settings: custom domain, Always Use HTTPS, `www` proxied DNS plus Bulk Redirect preserving path/query, Access on previews, deploy hook, Crawler Hints, Search Console, and Bing.
- [ ] Commit: `docs: add editor deployment and starter handoff guides`

## Task 17: Provision isolated services and deploy production

**Files:**

- Modify only with non-secret IDs: `studio/.env.example`, `web/.env.example`, `scripts/lib/guard-project.ts`, deployment docs
- Do not commit: actual `.env` files, tokens, hook URLs

**Interfaces:**

- Consumes: existing authenticated GitHub, Sanity, and Cloudflare sessions; `sorouh.site` zone
- Produces: private GitHub repo, independent Sanity project/dataset/Studio, protected Workers previews, and production site

- [ ] Preflight read-only auth and ownership: `gh auth status`, `pnpm --dir studio exec sanity projects list`, `pnpm --dir web exec wrangler whoami`, and Cloudflare zone/domain inspection. Stop before mutation if the signed-in account cannot own the deliverables.
- [ ] Create an independent project using the currently documented command shape: `pnpm --dir studio exec sanity projects create "شركة صروح الشرقية للمقاولات" --dataset production --dataset-visibility public --json`. Record the returned project ID in non-secret config, configure allowed CORS origins for local Studio and the deployed Studio/site, and never reuse another client's project.
- [ ] Run schema validation/deployment and TypeGen; execute the reviewed Sorouh seed dry run, then create-missing import. Confirm document counts, links, images, and `_updatedAt` behavior after publishing.
- [ ] Deploy Studio with `pnpm --dir studio exec sanity deploy`, choosing a unique Sorouh hostname. Verify client login and restricted navigation.
- [ ] Build from live published Sanity and run the entire release gate. Inspect representative output manually before publishing.
- [ ] Create the private GitHub repository only after confirming the intended owner: `gh repo create sorouh-site --private --source=. --remote=origin --push`. If the name exists, stop and resolve ownership/name rather than overwriting.
- [ ] Create/deploy `sorouh-site` using `pnpm --dir web exec wrangler deploy`; connect Workers Builds to `main`, add the custom domain, and store the Sanity deploy-hook secret only in Sanity/Cloudflare settings.
- [ ] Before enabling preview URLs, create Cloudflare Access protection for `*.sorouh-site.<account-subdomain>.workers.dev` preview hostnames and test unauthorized `403/login` plus authorized access. Do not publish an unprotected preview URL.
- [ ] Enable Always Use HTTPS. Add proxied `www` DNS and a 301 Bulk Redirect from `www.sorouh.site` to apex with subpath/query preservation. Enable Crawler Hints. Keep these rules out of `_redirects`.
- [ ] Test the live URL matrix: HTTP, HTTPS, `www`, apex, missing/present trailing slash, `.html`, query preservation, 404, internal old slug, and no redirect loops.
- [ ] Verify the webhook by publishing a harmless reviewed content change, observing Workers Build, and confirming the new published `_updatedAt` reaches Article `dateModified`/eligible sitemap `lastmod` while draft-only edits do not.
- [ ] Add Search Console and Bing verification, submit `https://sorouh.site/sitemap.xml`, and verify robots/RSS/video sitemap are fetchable. Do not claim indexing or ranking immediately.
- [ ] Commit any final non-secret deployment identifiers/docs: `chore: document Sorouh production deployment`

## Task 18: Final review and delivery

**Files:**

- Review: all tracked files and generated live output
- Update: `docs/release-checklist.md`

**Interfaces:**

- Consumes: completed repository, Sanity content, Cloudflare production, GitHub private repo
- Produces: evidence-backed delivery with no placeholders or leaked secrets

- [ ] Run a placeholder scan: `rg -n "TODO|TBD|FIXME|example\\.com|lorem|YOUR_|CHANGE_ME" --glob '!pnpm-lock.yaml' .` and resolve every production hit.
- [ ] Run a secret/media scan for tokens, hook URLs, `.env`, local source paths, MP4, and accidental client cross-contamination.
- [ ] Run a type-consistency audit: schema extraction → TypeGen → `git diff --exit-code web/src/sanity/sanity.types.ts`; then `pnpm check`, all tests, live-content build, dist validation, and Wrangler dry run.
- [ ] Use the `superpowers:requesting-code-review` skill for an independent requirements/code review, address verified findings, then rerun the full gate.
- [ ] Run `superpowers:verification-before-completion`; record the fresh command outputs, production URLs, deployment IDs, and known non-blocking limitations.
- [ ] Verify every approved requirement from the design spec has either an implementation reference or an explicit accepted non-build decision.
- [ ] Deliver the private repo, production URL, Sanity Studio URL, editor guide, deployment/rollback runbook, and external-setting checklist. Report actual outcomes only; never promise a specific search ranking.
- [ ] Commit: `chore: finalize Sorouh production handoff`

## Execution Checkpoints

- **Checkpoint A — Foundation:** Tasks 1–6 pass unit/type/schema tests before visual work.
- **Checkpoint B — Content and UI:** Tasks 7–12 pass fixture build and browser tests before cloud mutation.
- **Checkpoint C — Static delivery:** Tasks 13–16 pass full offline release gate before production deployment.
- **Checkpoint D — Production:** Tasks 17–18 validate live redirects, Access protection, publish webhook, discovery files, and handoff ownership.

## Definition of Done

- `pnpm check`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, live-content dist validation, and Wrangler dry-run all pass from a clean checkout.
- The generated site contains every approved page, five original Sorouh articles, build-time discovery files, accurate canonical/lastmod behavior, visible real YouTube iframes, and no invented business data.
- `sorouh.site` serves the Cloudflare Workers Static Assets deployment; protocol/host/trailing-slash behavior is canonical and loop-free; previews are protected by Access.
- Sorouh owns an independent Sanity project with `production` dataset and hosted Studio, plus a private GitHub repository and documented rollback.
- The reusable starter contains structure and automation only; Sorouh-specific content remains isolated under `content/sorouh` and is excluded from future-client bootstrap.
