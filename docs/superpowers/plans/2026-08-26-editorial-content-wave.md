# Editorial Content Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish five data-led Arabic decision guides that strengthen priority services through useful internal links and illustrative images.

**Architecture:** A typed editorial source adds unique article records to the existing content inventory. A safe Sanity publisher uploads only the five approved generated images and creates only missing posts; the Astro snapshot uses the published documents to build routes, RSS, sitemap, related-article links, and Article schema.

**Tech Stack:** TypeScript, Vitest, Sanity 6, Astro 7 SSG, Cloudflare Workers static assets, built-in image generation.

**Spec:** `docs/superpowers/specs/2026-08-26-editorial-content-wave-design.md`

## Global Constraints

- Use only the five approved decision-guide topics derived from recorded Keyword Planner demand.
- Do not use a city keyword as the article’s commercial owner; city/service landing pages remain the transactional owners.
- Every generated image has a visible illustrative caption and is never labeled as a completed Sorouh project.
- Never make price, guarantee, certification, response-time, client, or project-count claims.
- The Sanity publisher must dry-run before applying, use `ki7bs4vk/production`, and refuse existing post IDs.

---

### Task 1: Define and validate the editorial source

**Files:**
- Modify: `content/sorouh/site-content.ts`
- Modify: `content/sorouh/semantic-media-plan.ts`
- Test: `scripts/lib/site-content-inventory.test.ts`

- [ ] Add a failing test that expects exactly these new post keys: `roof-insulation-guide`, `water-leak-before-renovation`, `gypsum-board-planning`, `wall-preparation-before-painting`, and `annex-construction-checklist`.
- [ ] Run the focused test and confirm the missing keys fail.
- [ ] Add five complete article records with distinct title, excerpt, category, linked services, linked posts, and published dates after the existing five posts.
- [ ] Extend the semantic media targets, assets, and placements with one generated illustrative asset per new post.
- [ ] Run the focused inventory and media tests, then commit the source.

### Task 2: Generate and validate the article images

**Files:**
- Create: five `.webp` files under `content/sorouh/semantic-media/`
- Modify: `content/sorouh/semantic-media-plan.ts`
- Test: `scripts/lib/semantic-media.test.ts`

- [ ] Generate one 16:9 clean editorial construction image for each approved guide with no logos, people identifiable as Sorouh staff, text, watermark, or unsupported safety claim.
- [ ] Inspect every output, move it into the workspace with a new descriptive filename, and ensure its media-plan caption begins with `صورة توضيحية`.
- [ ] Run semantic-media validation to prove every post has exactly one valid placement.

### Task 3: Safely publish the editorial wave to Sanity

**Files:**
- Create: `scripts/lib/build-editorial-content-wave.ts`
- Create: `scripts/lib/build-editorial-content-wave.test.ts`
- Create: `scripts/apply-editorial-content-wave.ts`
- Modify: `package.json`

- [ ] Write a failing pure-builder test for five creates, stable post IDs, related service/post references, and refusal to recreate `post-roof-insulation-guide`.
- [ ] Implement the pure builder with deterministic Portable Text, FAQ-safe CTA blocks, SEO metadata, and reference validation.
- [ ] Implement dry-run/apply commands that verify the expected Sanity project and dataset, upload/reuse only the five article assets, create five posts in one transaction, and refetch titles, slugs, and references.
- [ ] Run unit checks, dry-run, apply, and refetch verification; commit the publisher.

### Task 4: Build, deploy, and verify the new content

**Files:**
- Modify: `scripts/verify-production.ts`
- Modify: `scripts/verify-production.test.ts`
- Generated: `web/src/data/site-snapshot.json`

- [ ] Add a failing production verifier expectation for the five article paths, sitemap entries, canonical URLs, indexability, and one H1.
- [ ] Implement the expectations and run the focused verifier test.
- [ ] Build the current published Sanity snapshot, then run web unit, e2e, build, and distribution validation.
- [ ] Deploy to Cloudflare after a successful dry-run and verify the five live article URLs.
- [ ] Commit verification changes and merge directly into `feat/enable-gtm` after final checks.

## Plan Self-Review

- The source, image, publisher, and live verifier each have a discrete testable responsibility.
- The plan preserves existing article and service ownership; it creates only approved guides.
- No step requires an unrecorded keyword volume, unverified claim, or a fabricated portfolio image.
