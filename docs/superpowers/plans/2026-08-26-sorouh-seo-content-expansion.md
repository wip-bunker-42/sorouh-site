# Sorouh SEO Content Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** توسيع محفظة صروح بأربع خدمات مؤكدة، إضافة بنية انتقائية لصفحات خدمة × مدينة، وربط المحتوى والوسائط دون تثبيت مصفوفة صفحات آلية.

**Architecture:** يبقى `service` هو مصدر الخدمة العامة، ويُضاف نوع Sanity مستقل `serviceAreaLanding` لا يُنشأ إلا لقرار بحث معتمد. تُشتق URLs من slugs الخدمة والمنطقة، وتدخل المستندات المنشورة فقط في snapshot وsitemap والربط الداخلي؛ أما القرارات البحثية فتبقى في سجل الكلمات حتى تفعيلها.

**Tech Stack:** Astro 7 SSG، Sanity 6، GROQ، TypeScript 6.0.3، Vitest 4، Portable Text، Sanity Image CDN، ImageGen للوسائط المصممة.

**Spec:** `docs/superpowers/specs/2026-08-26-sorouh-seo-growth-design.md`

## Global Constraints

- تعتمد هذه الخطة على اكتمال `2026-08-26-sorouh-seo-foundation-measurement.md` ووجود `SEO_KEYWORD_TARGETS` صالح.
- اللغة `ar-SA` والدومين `https://sorouh.site` وtrailing slash إلزامي.
- لا تُنشأ صفحة خدمة × مدينة بلا قرار بحث نشط، محتوى محلي مختلف، خدمة فعلية، وصورة مناسبة.
- لا تُنشأ 17 × 10 صفحة آليًا، ولا تتغير URLs الحالية دون 301.
- الصور المصممة تدخل طبيعيًا في الخدمة أو المقال أو الصفحة المحلية، وتبقى الصور الأصلية مادة المشروعات الأساسية.
- Seed صروح يظل create-missing؛ تحديث المستندات الحالية يستخدم dry-run وapply صريحين.
- لا أسرار Sanity داخل المستودع؛ `--with-user-token` أو CI secret فقط.
- TDD وcommit مستقل بعد كل مهمة.

## File Structure

- `content/sorouh/site-content.ts`: الخدمات الأربع الجديدة ومحتواها الأساسي.
- `content/sorouh/service-area-landings.ts`: محتوى الصفحات المحلية المعتمدة فقط.
- `content/sorouh/semantic-media-plan.ts`: أصول ومواضع الوسائط الجديدة.
- `content/sorouh/semantic-media/*.webp`: أربع صور خدمة وأصول محلية مطلوبة.
- `studio/src/schemaTypes/documents/serviceAreaLanding.ts`: نموذج Sanity الانتقائي.
- `web/src/pages/الخدمات/[service]/[area].astro`: route الصفحة المحلية.
- `web/src/sanity/queries.ts`: جلب `serviceAreaLandings` وعلاقاتها.
- `web/src/lib/content/{validate,normalize,contract}.ts`: snapshot والتحقق.
- `web/src/lib/seo/discovery.ts`: sitemap وredirects للمسارات الجديدة.
- `scripts/seed-sorouh.ts`: إنشاء المستندات المفقودة.
- `scripts/apply-seo-expansion.ts`: patch صريح للعلاقات المُدارة في المستندات الموجودة.
- `scripts/lib/build-seo-expansion-patches.ts`: دالة patches نقية قابلة للاختبار.

---

### Task 1: Remove the Fixed 13-Service Ceiling

**Files:**
- Modify: `content/sorouh/invariants.ts`
- Modify: `web/src/lib/tests/invariants.test.ts`
- Modify: `studio/src/schemaTypes/documents/serviceArea.ts`
- Modify: `studio/src/tests/schema.test.ts`
- Create: `scripts/lib/site-content-inventory.test.ts`

**Interfaces:**
- Consumes: `services`, `areas`, و`categories` من `site-content.ts`.
- Produces: تحقق ديناميكي من المفاتيح والحد الأدنى بدل عدد خدمات نهائي ثابت.

- [ ] **Step 1: Write failing dynamic inventory tests**

```ts
import { describe, expect, test } from 'vitest'
import { areas, categories, SERVICE_KEYS, services } from '../../content/sorouh/site-content'

describe('Sorouh content inventory', () => {
  test('keeps every service key unique and represented by one service', () => {
    const keys = Object.values(SERVICE_KEYS)
    expect(new Set(keys).size).toBe(keys.length)
    expect(new Set(services.map((service) => service.key))).toEqual(new Set(keys))
  })

  test('preserves the approved geographic and category baseline without fixing service growth', () => {
    expect(areas.length).toBeGreaterThanOrEqual(10)
    expect(categories.length).toBeGreaterThanOrEqual(5)
    expect(services.length).toBeGreaterThanOrEqual(13)
  })
})
```

Change the invariant assertion to:

```ts
expect(CONTENT_MINIMUMS).toEqual({ services: 13, areas: 10, categories: 5 })
```

- [ ] **Step 2: Run the tests and verify the missing exports**

Run: `pnpm vitest run scripts/lib/site-content-inventory.test.ts web/src/lib/tests/invariants.test.ts`

Expected: FAIL because `CONTENT_MINIMUMS` is not exported and the inventory test does not yet exist.

- [ ] **Step 3: Replace exact counts with minimums**

In `content/sorouh/invariants.ts`:

```ts
export const CONTENT_MINIMUMS = {
  services: 13,
  areas: 10,
  categories: 5,
} as const
```

Replace `CONTENT_COUNTS` imports in the invariant test with `CONTENT_MINIMUMS`. Do not add a new exact service count elsewhere.

- [ ] **Step 4: Remove the Sanity array ceiling tied to 13**

Change `featuredServices` validation to:

```ts
validation: (rule) => rule.required().min(4).unique(),
```

Add a schema source assertion:

```ts
test('does not cap featured services at the launch inventory', () => {
  const field = (rawType('serviceArea').fields ?? []).find((item) => item.name === 'featuredServices')
  expect(field?.validation).toBeTypeOf('function')
  expect(String(field?.validation)).not.toContain('max(13)')
})
```

- [ ] **Step 5: Run focused and schema tests**

Run: `pnpm vitest run scripts/lib/site-content-inventory.test.ts web/src/lib/tests/invariants.test.ts studio/src/tests/schema.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the dynamic inventory rule**

```bash
git add content/sorouh/invariants.ts web/src/lib/tests/invariants.test.ts studio/src/schemaTypes/documents/serviceArea.ts studio/src/tests/schema.test.ts scripts/lib/site-content-inventory.test.ts
git commit -m "refactor: allow data-driven service growth"
```

### Task 2: Add Four Confirmed Service Clusters

**Files:**
- Modify: `content/sorouh/site-content.ts`
- Modify: `scripts/lib/site-content-inventory.test.ts`
- Modify: `scripts/seed-sorouh.ts`

**Interfaces:**
- Consumes: existing `ServiceContent` shape and `serviceFaqs(title)`.
- Produces: service keys `roofInsulation`, `leakDetection`, `annexConstruction`, و`demolition`.

- [ ] **Step 1: Add failing content assertions**

```ts
test('includes every newly confirmed service with complete commercial content', () => {
  const required = ['roof-insulation', 'water-leak-detection', 'annex-construction', 'demolition-removal']
  for (const key of required) {
    const service = services.find((item) => item.key === key)
    expect(service, key).toBeDefined()
    expect(service!.summary.length).toBeGreaterThan(50)
    expect(service!.directAnswer.length).toBeGreaterThan(80)
    expect(service!.deliverables.length).toBeGreaterThanOrEqual(4)
    expect(service!.process.length).toBeGreaterThanOrEqual(4)
    expect(service!.quality.length).toBeGreaterThanOrEqual(3)
    expect(service!.faqs.length).toBeGreaterThanOrEqual(3)
  }
})
```

- [ ] **Step 2: Run the inventory test and confirm failure**

Run: `pnpm vitest run scripts/lib/site-content-inventory.test.ts`

Expected: FAIL on `roof-insulation`.

- [ ] **Step 3: Add exact service keys**

```ts
roofInsulation: 'roof-insulation',
leakDetection: 'water-leak-detection',
annexConstruction: 'annex-construction',
demolition: 'demolition-removal',
```

- [ ] **Step 4: Add complete service entries**

Add these four objects to `services`:

```ts
{
  key: SERVICE_KEYS.roofInsulation,
  title: 'عزل الأسطح',
  slug: 'عزل-الاسطح',
  mediaKey: 'generated-roof-insulation',
  summary: 'تنفيذ عزل مائي وحراري للأسطح في الدمام والخبر ومدن المنطقة الشرقية بحسب حالة السطح ونوع الاستخدام.',
  directAnswer: 'نعاين السطح ومصادر الرطوبة والفواصل والميول أولًا، ثم نحدد نظام العزل وتجهيز القاعدة واختبار التصريف قبل تطبيق الطبقات وحماية العزل ومراجعته.',
  deliverables: ['معاينة السطح وتحديد مواضع الضعف', 'تجهيز وتنظيف ومعالجة الفواصل', 'تنفيذ نظام العزل المتفق عليه', 'اختبار التصريف ومراجعة نقاط الالتقاء', 'حماية الطبقات وتسليم الموقع'],
  process: ['فحص الحالة والميول', 'اختيار النظام وتجهيز القاعدة', 'تطبيق طبقات العزل', 'الاختبار والحماية والتسليم'],
  quality: ['معالجة السبب قبل تغطيته', 'تفاصيل دقيقة حول المصارف والحواف', 'مراجعة تماسك واستمرارية طبقة العزل'],
  faqs: serviceFaqs('عزل الأسطح'),
},
{
  key: SERVICE_KEYS.leakDetection,
  title: 'كشف ومعالجة تسربات المياه',
  slug: 'كشف-ومعالجة-تسربات-المياه',
  mediaKey: 'generated-water-leak-detection',
  summary: 'فحص مؤشرات تسرب المياه وتحديد مصدر الخلل ثم تنفيذ المعالجة المناسبة لشبكات ومناطق البلل في المنطقة الشرقية.',
  directAnswer: 'نبدأ بتحديد العلامات ومسار الشبكة وعزل الاحتمالات، ثم نختبر المصدر الأقرب قبل فتح التشطيبات حتى تكون المعالجة موجهة ويقل التكسير غير الضروري.',
  deliverables: ['قراءة علامات الرطوبة أو فقد الضغط', 'اختبار النقاط والمسارات المحتملة', 'تحديد نطاق الفتح أو الإصلاح', 'معالجة سبب التسرب', 'اختبار ما بعد الإصلاح وإعادة التشطيب عند الاتفاق'],
  process: ['جمع الأعراض ومعاينة الموقع', 'اختبارات وعزل الاحتمالات', 'تنفيذ الإصلاح', 'إعادة الاختبار والتسليم'],
  quality: ['عدم الاكتفاء بتغطية أثر الرطوبة', 'اختبار قبل وبعد الإصلاح', 'تقليل الفتح إلى النطاق اللازم'],
  faqs: serviceFaqs('كشف ومعالجة تسربات المياه'),
},
{
  key: SERVICE_KEYS.annexConstruction,
  title: 'بناء الملاحق',
  slug: 'بناء-الملاحق',
  mediaKey: 'generated-annex-construction',
  summary: 'تنفيذ ملاحق سكنية ومجالس وغرف خدمات من تجهيز الموقع وأعمال البناء حتى التشطيب في المنطقة الشرقية.',
  directAnswer: 'نراجع المساحة والاستخدام والمخططات والمتطلبات قبل التنفيذ، ثم نرتب الأعمال المدنية وفتحات الخدمات والعزل والتشطيبات حتى يصبح الملحق جزءًا عمليًا من العقار.',
  deliverables: ['معاينة وقراءة المساحة والاستخدام', 'أعمال القواعد والبناء حسب النطاق', 'تأسيس الكهرباء والسباكة والفتحات', 'العزل والتشطيبات', 'مراجعة وربط الملحق بالموقع القائم'],
  process: ['تحديد الاستخدام والنطاق', 'تجهيز وأعمال مدنية', 'تأسيس الخدمات', 'التشطيب والمراجعة'],
  quality: ['توافق الأبعاد والمناسيب مع الموقع', 'تنسيق الفتحات قبل الإغلاق', 'معالجة نقاط التقاء الجديد بالقائم'],
  faqs: serviceFaqs('بناء الملاحق'),
},
{
  key: SERVICE_KEYS.demolition,
  title: 'الهدم والإزالة',
  slug: 'الهدم-والازالة',
  mediaKey: 'generated-demolition-removal',
  summary: 'هدم وإزالة عناصر ومبانٍ ضمن نطاق محدد مع تنظيم الموقع ورفع المخلفات تمهيدًا للبناء أو الترميم في المنطقة الشرقية.',
  directAnswer: 'نحدد حدود الإزالة والعناصر والخدمات المحيطة ومسار إخراج المخلفات قبل بدء العمل، ثم ننفذ الهدم بالتدرج ونفصل المواد ونجهز الموقع للمرحلة التالية.',
  deliverables: ['معاينة وحدود واضحة للإزالة', 'فصل الخدمات ضمن نطاق العمل', 'هدم أو تكسير منظم', 'تحميل ورفع المخلفات حسب الاتفاق', 'تنظيف وتجهيز الموقع للمرحلة التالية'],
  process: ['توثيق النطاق والمحيط', 'تجهيز وفصل الخدمات', 'الهدم والفرز والرفع', 'التنظيف والمراجعة'],
  quality: ['حماية العناصر التي ستبقى', 'مسار منظم للمخلفات', 'توقف ومراجعة عند ظهور عنصر خارج النطاق'],
  faqs: serviceFaqs('الهدم والإزالة'),
},
```

- [ ] **Step 5: Run inventory and render-contract tests**

Run: `pnpm vitest run scripts/lib/site-content-inventory.test.ts web/src/lib/tests/content.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the service content**

```bash
git add content/sorouh/site-content.ts scripts/lib/site-content-inventory.test.ts scripts/seed-sorouh.ts
git commit -m "feat: add high-demand contracting services"
```

### Task 3: Generate and Register Semantic Service Media

**Files:**
- Create: `content/sorouh/semantic-media/roof-insulation.webp`
- Create: `content/sorouh/semantic-media/water-leak-detection.webp`
- Create: `content/sorouh/semantic-media/annex-construction.webp`
- Create: `content/sorouh/semantic-media/demolition-removal.webp`
- Modify: `content/sorouh/semantic-media-plan.ts`
- Modify: `scripts/lib/sorouh-semantic-media-plan.test.ts`

**Interfaces:**
- Consumes: service media keys from Task 2.
- Produces: four 3:2 WebP assets and matching `service-<key>` placements.

- [ ] **Step 1: Extend the failing coverage expectation**

Update the expected result to the count derived from the actual plan rather than a hand-maintained old number:

```ts
const result = validateSemanticMediaPlan(sorouhSemanticMediaPlan, expectedSemanticMediaTargets)
expect(result.assets).toBe(sorouhSemanticMediaPlan.assets.length)
expect(result.placements).toBe(expectedSemanticMediaTargets.length)
for (const key of ['generated-roof-insulation', 'generated-water-leak-detection', 'generated-annex-construction', 'generated-demolition-removal']) {
  expect(sorouhSemanticMediaPlan.assets.some((asset) => asset.key === key)).toBe(true)
}
```

- [ ] **Step 2: Run the media-plan test and confirm failure**

Run: `pnpm vitest run scripts/lib/sorouh-semantic-media-plan.test.ts`

Expected: FAIL because the four assets are absent.

- [ ] **Step 3: Use the imagegen skill with four exact prompts**

Generate one photorealistic, landscape 3:2 image per prompt, without visible logos, phone numbers, captions, watermarks, or text:

```text
roof-insulation.webp — Saudi residential villa rooftop in the Eastern Province, professional crew applying a clean white waterproof and thermal insulation membrane around drains and parapets, realistic Gulf daylight, safe organized worksite, premium construction photography, no text.

water-leak-detection.webp — technician inside a modern Saudi home inspecting a plumbing wall with a professional moisture meter and thermal imaging device, limited access opening, clean protected finishes, realistic documentary construction photography, no text.

annex-construction.webp — new residential annex under construction beside an existing Saudi villa, masonry walls, aligned openings and visible service conduits, organized materials, Eastern Province architecture and daylight, premium realistic construction photography, no text.

demolition-removal.webp — controlled interior demolition and debris removal in a Saudi villa renovation, workers separating material in a protected organized area, structural elements kept intact, realistic professional construction photography, no text.
```

Inspect every output with `view_image`. Regenerate an image if hands, tools, geometry, construction sequencing, or Saudi context are visibly wrong.

- [ ] **Step 4: Optimize the approved images**

Use the bundled `sharp` CLI through a repository script or existing dependency so each WebP is 1600×1067 or smaller, preserves 3:2 framing, and is below 350 KB. Do not upscale a smaller approved output.

- [ ] **Step 5: Register assets and placements**

Add asset records with their exact paths and placements:

```ts
{
  key: 'generated-roof-insulation',
  origin: 'generated',
  path: 'content/sorouh/semantic-media/roof-insulation.webp',
  topics: ['roof-insulation'],
},
{
  key: 'generated-water-leak-detection',
  origin: 'generated',
  path: 'content/sorouh/semantic-media/water-leak-detection.webp',
  topics: ['water-leak-detection'],
},
{
  key: 'generated-annex-construction',
  origin: 'generated',
  path: 'content/sorouh/semantic-media/annex-construction.webp',
  topics: ['annex-construction'],
},
{
  key: 'generated-demolition-removal',
  origin: 'generated',
  path: 'content/sorouh/semantic-media/demolition-removal.webp',
  topics: ['demolition-removal'],
},
```

Add these placement objects; generated assets must keep the existing illustrative-caption contract:

```ts
{
  target: `service-${SERVICE_KEYS.roofInsulation}`,
  role: 'service',
  assetKey: 'generated-roof-insulation',
  topic: 'roof-insulation',
  alt: 'تنفيذ عزل مائي وحراري حول مصارف وحواف سطح فيلا سكنية',
  caption: illustrative('لخدمة عزل الأسطح'),
},
{
  target: `service-${SERVICE_KEYS.leakDetection}`,
  role: 'service',
  assetKey: 'generated-water-leak-detection',
  topic: 'water-leak-detection',
  alt: 'فني يفحص موضع رطوبة في جدار داخلي بأجهزة قياس مخصصة',
  caption: illustrative('لخدمة كشف ومعالجة تسربات المياه'),
},
{
  target: `service-${SERVICE_KEYS.annexConstruction}`,
  role: 'service',
  assetKey: 'generated-annex-construction',
  topic: 'annex-construction',
  alt: 'ملحق سكني تحت البناء بجوار فيلا مع فتحات وتمديدات مرتبة',
  caption: illustrative('لخدمة بناء الملاحق'),
},
{
  target: `service-${SERVICE_KEYS.demolition}`,
  role: 'service',
  assetKey: 'generated-demolition-removal',
  topic: 'demolition-removal',
  alt: 'هدم داخلي منظم ورفع مخلفات ضمن مشروع ترميم سكني',
  caption: illustrative('لخدمة الهدم والإزالة'),
},
```

- [ ] **Step 6: Verify media contracts**

Run: `pnpm vitest run scripts/lib/sorouh-semantic-media-plan.test.ts scripts/lib/semantic-media.test.ts`

Expected: PASS and all required asset paths exist.

Run: `pnpm audit:media`

Expected: PASS with no oversized or unsupported source.

- [ ] **Step 7: Commit media and plan**

```bash
git add content/sorouh/semantic-media content/sorouh/semantic-media-plan.ts scripts/lib/sorouh-semantic-media-plan.test.ts
git commit -m "feat: add semantic media for new services"
```

### Task 4: Service-Area Landing Content Model

**Files:**
- Create: `studio/src/schemaTypes/documents/serviceAreaLanding.ts`
- Modify: `studio/src/schemaTypes/index.ts`
- Modify: `studio/src/structure/index.ts`
- Modify: `studio/src/tests/schema.test.ts`
- Modify: `web/src/sanity/queries.ts`
- Modify: `web/src/lib/content/validate.ts`
- Modify: `web/src/lib/content/normalize.ts`
- Modify: `web/src/lib/content/contract.ts`
- Modify: `web/tests/fixtures/site-snapshot.json`
- Modify: `web/src/lib/tests/content.test.ts`

**Interfaces:**
- Produces Sanity type `serviceAreaLanding` with one required `service` and `serviceArea` reference.
- Produces normalized collection `serviceAreaLandings` and rejects duplicate service/area pairs.

- [ ] **Step 1: Write failing schema and normalization tests**

Add `serviceAreaLanding` to the expected compiled types and required fields:

```ts
expectRequiredFields('serviceAreaLanding', [
  'title', 'summary', 'service', 'serviceArea', 'heroImage', 'intro', 'deliverables', 'process', 'faqs'
])
```

Add a fixture landing and duplicate-pair test:

```ts
raw.serviceAreaLandings.push({ ...raw.serviceAreaLandings[0], _id: 'duplicate-local-page' })
expect(() => normalizeSnapshot(validateRawSnapshot(raw))).toThrow(
  'Duplicate serviceAreaLanding pair: fixture-service/fixture-area',
)
```

- [ ] **Step 2: Run schema and content tests**

Run: `pnpm vitest run studio/src/tests/schema.test.ts web/src/lib/tests/content.test.ts`

Expected: FAIL because the type and collection do not exist.

- [ ] **Step 3: Implement the Sanity document**

Define fields in this order:

```ts
titleField,
summaryField,
defineField({ name: 'service', title: 'الخدمة', type: 'reference', to: [{ type: 'service' }], validation: (rule) => rule.required() }),
defineField({ name: 'serviceArea', title: 'المدينة أو المنطقة', type: 'reference', to: [{ type: 'serviceArea' }], validation: (rule) => rule.required() }),
defineField({ name: 'heroImage', title: 'الصورة الرئيسية', type: 'contentImage', group: 'media', validation: (rule) => rule.required() }),
defineField({ name: 'intro', title: 'المقدمة المحلية', type: 'portableText', group: 'content', validation: (rule) => rule.required().min(1) }),
defineField({ name: 'deliverables', title: 'نطاق التنفيذ المحلي', type: 'array', group: 'content', of: [defineArrayMember({ type: 'string' })], validation: (rule) => rule.required().min(4).max(10).unique() }),
defineField({ name: 'process', title: 'خطوات التنفيذ', type: 'array', group: 'content', of: [defineArrayMember({ type: 'string' })], validation: (rule) => rule.required().min(3).max(8) }),
defineField({ name: 'faqs', title: 'أسئلة محلية', type: 'array', group: 'content', of: [defineArrayMember({ type: 'faqItem' })], validation: (rule) => rule.required().min(3).max(8) }),
seoField,
redirectFromField,
```

Register it after `serviceArea`, and expose it in Studio as `صفحات الخدمات المحلية`.

- [ ] **Step 4: Add the GROQ collection**

```groq
"serviceAreaLandings": *[_type == "serviceAreaLanding"] | order(title asc){
  _id, _type, _updatedAt, title, summary,
  service->{_id, title, "slug": slug.current},
  serviceArea->{_id, title, "slug": slug.current},
  heroImage{${IMAGE_FIELDS}}, intro[]{${PORTABLE_TEXT_FIELDS}},
  deliverables, process, faqs[]{_key, question, answer},
  seo{${SEO_FIELDS}}, redirectFrom
}
```

- [ ] **Step 5: Extend raw, normalized, and render contracts**

Add `serviceAreaLandings: RawDocument[]` to `RawSnapshot` and `COLLECTIONS`. Normalize published documents and validate each required render field. Reject a missing service or area reference and duplicate `${service._id}/${serviceArea._id}` pairs.

- [ ] **Step 6: Add one complete fixture document and rerun tests**

The fixture document must reference the existing fixture service and area, include one image, one Portable Text block, four deliverables, three process steps, three FAQ items, and SEO metadata.

Run: `pnpm vitest run studio/src/tests/schema.test.ts web/src/lib/tests/content.test.ts`

Expected: PASS including duplicate-pair rejection.

- [ ] **Step 7: Generate types and commit**

Run: `pnpm check:schema`

Expected: PASS and `web/src/sanity/sanity.types.ts` changes only for the new document/query shape.

```bash
git add studio/src/schemaTypes/documents/serviceAreaLanding.ts studio/src/schemaTypes/index.ts studio/src/structure/index.ts studio/src/tests/schema.test.ts web/src/sanity/queries.ts web/src/sanity/sanity.types.ts web/src/lib/content/validate.ts web/src/lib/content/normalize.ts web/src/lib/content/contract.ts web/tests/fixtures/site-snapshot.json web/src/lib/tests/content.test.ts
git commit -m "feat: model selective local service pages"
```

### Task 5: Route, Sitemap, Redirects, and Internal Links

**Files:**
- Create: `web/src/pages/الخدمات/[service]/[area].astro`
- Modify: `web/src/lib/seo/discovery.ts`
- Modify: `web/src/lib/tests/discovery.test.ts`
- Modify: `web/src/pages/الخدمات/[slug].astro`
- Modify: `web/src/pages/مناطق-الخدمة/[slug].astro`
- Modify: `web/tests/integration/build.test.ts`

**Interfaces:**
- Consumes: normalized `serviceAreaLandings`.
- Produces: `/الخدمات/<service-slug>/<area-slug>/` pages, sitemap entries, redirects, and contextual links.

- [ ] **Step 1: Write failing route-family and discovery tests**

```ts
test('lists selective service-area landing pages once', () => {
  const entries = pageEntries(data)
  expect(entries.map((entry) => entry.path)).toContain(
    '/الخدمات/مقاولات-عامة/الدمام/',
  )
})
```

Build integration:

```ts
it('renders the selective local service route with canonical and service schema', () => {
  const path = 'الخدمات/مقاولات-عامة/الدمام/index.html'
  expect(existsSync(join(dist, path))).toBe(true)
  const $ = load(read(path))
  expect($('link[rel="canonical"]').attr('href')).toBe(
    'https://sorouh.site/الخدمات/مقاولات-عامة/الدمام/',
  )
  expect($('script[type="application/ld+json"]').text()).toContain('Service')
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/discovery.test.ts`

Expected: FAIL because `pageEntries` omits local landings.

- [ ] **Step 3: Implement the local page template**

The page must:

```ts
export function getStaticPaths() {
  return loadSnapshot().serviceAreaLandings.map((landing) => ({
    params: { service: landing.service.slug, area: landing.serviceArea.slug },
    props: { landing },
  }))
}
```

Render exactly one H1 using `landing.title`, the summary, hero image, Portable Text intro, deliverables, process, FAQs, contact actions, related projects matching both references, and links back to the parent service and area. Build `Service` schema with `areaServed` restricted to the referenced area.

- [ ] **Step 4: Extend discovery and redirects**

Add entries:

```ts
...data.serviceAreaLandings.map((d) => ({
  ...d,
  path: `/الخدمات/${d.service.slug}/${d.serviceArea.slug}/`,
  image: d.heroImage?.asset?.url,
}))
```

Add each route to `liveRoutes`. For `redirectFrom`, treat a leading `/` as a full path; otherwise prefix `/الخدمات/` once.

- [ ] **Step 5: Add contextual link sections**

On the parent service page, filter landings by `landing.service._id === service._id`. On the area page, filter by `landing.serviceArea._id === area._id`. Render the section only when at least one published landing exists.

- [ ] **Step 6: Run discovery, build, and dist audit**

Run: `pnpm --filter @sorouh/web test -- src/lib/tests/discovery.test.ts`

Expected: PASS.

Run: `pnpm --filter @sorouh/web test:build`

Expected: PASS with the fixture route, unique canonical, sitemap inclusion, and at least two incoming internal links.

- [ ] **Step 7: Commit the route family**

```bash
git add -- web/src/pages/الخدمات/[service]/[area].astro web/src/lib/seo/discovery.ts web/src/lib/tests/discovery.test.ts web/src/pages/الخدمات/[slug].astro web/src/pages/مناطق-الخدمة/[slug].astro web/tests/integration/build.test.ts
git commit -m "feat: render selective local service pages"
```

### Task 6: First Data-Approved Local Pages

**Files:**
- Create: `content/sorouh/service-area-landings.ts`
- Create: `scripts/lib/service-area-landings.test.ts`
- Modify: `scripts/seed-sorouh.ts`
- Modify: `scripts/validate-seo-keyword-targets.ts`
- Modify: `content/sorouh/seo/keyword-targets.ts`

**Interfaces:**
- Consumes: service and area keys.
- Produces: deterministic Sanity IDs `service-area-<service-key>-<area-key>` and activates matching keyword targets only after content validation.

- [ ] **Step 1: Write failing decision/content tests**

```ts
import { describe, expect, test } from 'vitest'
import { serviceAreaLandings } from '../../content/sorouh/service-area-landings'

describe('approved service-area landing content', () => {
  test('contains only the first reviewed opportunities', () => {
    expect(serviceAreaLandings.map((item) => item.key).sort()).toEqual([
      'annex-dammam',
      'painter-dammam',
      'renovation-dammam',
      'renovation-khobar',
      'roof-insulation-ahsa',
    ])
  })

  test('keeps each local angle and summary unique', () => {
    expect(new Set(serviceAreaLandings.map((item) => item.summary)).size).toBe(serviceAreaLandings.length)
    expect(new Set(serviceAreaLandings.map((item) => item.localAngle)).size).toBe(serviceAreaLandings.length)
    for (const item of serviceAreaLandings) {
      expect(item.deliverables.length).toBeGreaterThanOrEqual(4)
      expect(item.process.length).toBeGreaterThanOrEqual(3)
      expect(item.faqs.length).toBeGreaterThanOrEqual(3)
    }
  })
})
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run: `pnpm vitest run scripts/lib/service-area-landings.test.ts`

Expected: FAIL because the content file is missing.

- [ ] **Step 3: Add the exact five decisions**

Create the file with this complete literal content; do not call a shared text generator:

```ts
import { SERVICE_KEYS } from './site-content'

type Faq = { question: string; answer: string }
export type ServiceAreaLandingContent = {
  key: string
  title: string
  serviceKey: string
  areaKey: string
  summary: string
  localAngle: string
  deliverables: string[]
  process: string[]
  faqs: Faq[]
}

export const serviceAreaLandings: ServiceAreaLandingContent[] = [
  {
    key: 'renovation-dammam',
    title: 'مقاول ترميم في الدمام للمنازل والفلل',
    serviceKey: SERVICE_KEYS.restoration,
    areaKey: 'dammam',
    summary: 'ترميم منازل وفلل في الدمام يبدأ بتحديد أسباب التلف وترتيب الإصلاحات المدنية والخدمات والتشطيبات ضمن نطاق واحد.',
    localAngle: 'نخدم مشاريع الترميم في أحياء الدمام عبر معاينة توضح ما يحتاج إصلاحًا أو استبدالًا، مع حماية الأجزاء السليمة وتنظيم مراحل الهدم والتأسيس والتشطيب.',
    deliverables: ['معاينة وتوثيق الحالة', 'هدم وإزالة ضمن نطاق متفق عليه', 'إصلاحات مدنية وكهرباء وسباكة عند الحاجة', 'تشطيبات ومراجعة قبل التسليم'],
    process: ['معاينة العقار في الدمام', 'ترتيب الأولويات والنطاق', 'التنفيذ المرحلي', 'الاختبار والتسليم'],
    faqs: [
      { question: 'هل يشمل ترميم المنزل في الدمام الكهرباء والسباكة؟', answer: 'يمكن إدخال تجديد الكهرباء والسباكة في النطاق بعد فحص حالتهما وتحديد ما يحتاج إصلاحًا أو استبدالًا.' },
      { question: 'هل يمكن ترميم جزء من الفيلا فقط؟', answer: 'نعم، يمكن تحديد دور أو غرفة أو واجهة أو مجموعة بنود مستقلة حسب حالة الموقع.' },
      { question: 'كيف يبدأ تسعير الترميم؟', answer: 'يبدأ بالمعاينة وحصر البنود والكميات وحالة العناصر القائمة، ثم يُحدد نطاق واضح للتنفيذ.' },
    ],
  },
  {
    key: 'renovation-khobar',
    title: 'مقاول ترميم في الخبر للفلل والشقق',
    serviceKey: SERVICE_KEYS.restoration,
    areaKey: 'khobar',
    summary: 'ترميم فلل وشقق في الخبر مع تنسيق الإصلاحات والتأسيس والتشطيبات وحماية المساحات السليمة أثناء العمل.',
    localAngle: 'نرتب أعمال التجديد في عقارات الخبر بحسب حالة التشطيبات والخدمات، ونفصل المناطق التي تستمر في الاستخدام عن نطاق الإزالة والإصلاح قدر الإمكان.',
    deliverables: ['فحص التلف والتشطيبات القائمة', 'تنظيم الحماية والإزالة', 'تجديد البنود المدنية والخدمات المتفق عليها', 'إعادة التشطيب والتنظيف النهائي'],
    process: ['معاينة العقار في الخبر', 'تقسيم النطاق ومراحل العمل', 'الإصلاح والتجديد', 'المراجعة والتسليم'],
    faqs: [
      { question: 'هل تنفذون ترميم شقق في الخبر؟', answer: 'نعم، يُحدد النطاق حسب حالة الشقة والبنود المطلوبة وإمكانية العمل داخل المبنى.' },
      { question: 'هل يمكن حماية الغرف غير الداخلة في الترميم؟', answer: 'نرتب عزل نطاق العمل ومسارات المواد والمخلفات بحسب طبيعة الموقع لتقليل تأثير التنفيذ.' },
      { question: 'متى تُختبر الكهرباء والسباكة؟', answer: 'تُختبر الخدمات بعد التأسيس وقبل إغلاق الجدران أو الأرضيات، ثم تُراجع مرة أخرى عند التشغيل.' },
    ],
  },
  {
    key: 'painter-dammam',
    title: 'صباغ في الدمام للدهانات الداخلية والخارجية',
    serviceKey: SERVICE_KEYS.painting,
    areaKey: 'dammam',
    summary: 'تنفيذ دهانات منازل وفلل في الدمام بعد تجهيز الجدران ومعالجة العيوب واختيار النظام المناسب للأسطح الداخلية أو الخارجية.',
    localAngle: 'تبدأ جودة الدهان في الدمام من فحص الرطوبة والتشققات والتماسك، ثم تجهيز المعجون والبطانة قبل اعتماد اللون واللمعة وتنفيذ الأوجه النهائية.',
    deliverables: ['فحص وتجهيز الأسطح', 'معالجة الشروخ والعيوب السطحية', 'بطانة ومعجون وصنفرة بحسب الحالة', 'دهانات داخلية أو خارجية ومراجعة اللون'],
    process: ['معاينة الجدران والواجهات', 'تجهيز وحماية الموقع', 'تنفيذ النظام المعتمد', 'مراجعة التغطية والتنظيف'],
    faqs: [
      { question: 'هل تقدمون دهانات داخلية وخارجية في الدمام؟', answer: 'نعم، نحدد مواد التجهيز والدهان بحسب نوع السطح وموقعه وتعرضه للعوامل الخارجية.' },
      { question: 'هل يجب معالجة الرطوبة قبل الدهان؟', answer: 'نعم، يجب تحديد سبب الرطوبة ومعالجته قبل إعادة الطلاء حتى لا يعود التقشر أو التبقع.' },
      { question: 'كيف نختار اللون واللمعة؟', answer: 'تُراجع الإضاءة والاستخدام وحالة السطح، ويمكن اعتماد عينة صغيرة قبل تعميم اللون.' },
    ],
  },
  {
    key: 'annex-dammam',
    title: 'بناء ملاحق في الدمام للفلل والمنازل',
    serviceKey: SERVICE_KEYS.annexConstruction,
    areaKey: 'dammam',
    summary: 'بناء ملاحق ومجالس وغرف خدمات في الدمام مع ضبط المناسيب وفتحات الكهرباء والسباكة والعزل والتشطيب.',
    localAngle: 'نراجع علاقة الملحق بالعقار القائم ومسارات الحركة والخدمات قبل البناء، ثم ننسق نقاط الالتقاء والعزل والواجهات حتى يظهر الجزء الجديد متكاملًا مع الموقع.',
    deliverables: ['معاينة المساحة والاستخدام', 'أعمال مدنية وبناء حسب النطاق', 'تأسيس الكهرباء والسباكة والفتحات', 'عزل وتشطيب وربط بالعقار القائم'],
    process: ['مراجعة المساحة والمخططات', 'تنفيذ الأعمال المدنية', 'تأسيس الخدمات والعزل', 'التشطيب والمراجعة'],
    faqs: [
      { question: 'ما أنواع الملاحق التي تنفذونها في الدمام؟', answer: 'يشمل النطاق ملاحق سكنية ومجالس وغرف خدمات بحسب المساحة والمخطط والمتطلبات المتفق عليها.' },
      { question: 'هل يشمل العمل تشطيب الملحق؟', answer: 'يمكن تنفيذ البناء والتأسيس والتشطيب ضمن نطاق واحد أو تسليم مرحلة محددة حسب الاتفاق.' },
      { question: 'كيف تُربط خدمات الملحق بالمنزل؟', answer: 'تُراجع نقاط الكهرباء والتغذية والصرف ومساراتها قبل البناء لتقليل التعارض والتعديلات اللاحقة.' },
    ],
  },
  {
    key: 'roof-insulation-ahsa',
    title: 'شركة عزل أسطح في الأحساء للعزل المائي والحراري',
    serviceKey: SERVICE_KEYS.roofInsulation,
    areaKey: 'ahsa',
    summary: 'عزل أسطح في الأحساء لمعالجة تأثير الحرارة ومياه الأمطار عبر تجهيز السطح وضبط المصارف وتنفيذ نظام مائي أو حراري مناسب.',
    localAngle: 'تحتاج أسطح الأحساء إلى مراجعة الميول والمصارف والفواصل ومناطق التقاء الجدران قبل اختيار طبقات العزل، ثم اختبار التصريف وحماية النظام بعد التنفيذ.',
    deliverables: ['فحص السطح والميول والمصارف', 'معالجة الفواصل وتجهيز القاعدة', 'تنفيذ العزل المائي أو الحراري المتفق عليه', 'اختبار التصريف وحماية الطبقات'],
    process: ['المعاينة وتحديد النظام', 'التجهيز والمعالجات', 'تطبيق العزل', 'الاختبار والحماية'],
    faqs: [
      { question: 'هل تنفذون عزلًا مائيًا وحراريًا في الأحساء؟', answer: 'نحدد النظام المطلوب بعد معاينة السطح، ويمكن الجمع بين الحماية المائية والحرارية بحسب الحالة.' },
      { question: 'هل تُراجع ميول السطح قبل العزل؟', answer: 'نعم، تُفحص الميول والمصارف لأن تجمع المياه أو ضعف التصريف يؤثر في أداء نظام العزل.' },
      { question: 'هل يحتاج السطح إلى إزالة الطبقات القديمة؟', answer: 'يعتمد ذلك على تماسك الطبقات القائمة ونوعها ووجود تلف؛ تُحدد الإزالة أو المعالجة بعد الفحص.' },
    ],
  },
]
```

- [ ] **Step 4: Seed missing landing documents**

Import `serviceAreaLandings`, include deterministic IDs in `plannedIds`, and create documents only when absent. Reuse `plannedContentImage` when a specific placement exists; otherwise use the parent service hero image via a reviewed asset key. Use `portable()` for a title section plus `localAngle`, and build refs to the service and area IDs.

- [ ] **Step 5: Activate ownership only for documents ready to publish**

Set these owner paths:

```text
renovation-dammam → /الخدمات/ترميم-منازل-وفلل/الدمام/
renovation-khobar → /الخدمات/ترميم-منازل-وفلل/الخبر/
painter-dammam → /الخدمات/دهانات-داخلية-وخارجية/الدمام/
annex-dammam → /الخدمات/بناء-الملاحق/الدمام/
roof-insulation-ahsa → /الخدمات/عزل-الاسطح/الاحساء/
```

Change each matching target to `active` only in the same commit that adds its complete seed content.

Extend `scripts/validate-seo-keyword-targets.ts` so the live route set includes only the approved local content records:

```ts
import { serviceAreaLandings } from '../content/sorouh/service-area-landings'

const serviceSlugs = new Map(services.map((item) => [item.key, item.slug]))
const areaSlugs = new Map(areas.map((item) => [item.key, item.slug]))

for (const landing of serviceAreaLandings) {
  const serviceSlug = serviceSlugs.get(landing.serviceKey)
  const areaSlug = areaSlugs.get(landing.areaKey)
  if (!serviceSlug || !areaSlug) throw new Error(`Unknown local landing relation: ${landing.key}`)
  livePaths.add(`/الخدمات/${serviceSlug}/${areaSlug}/`)
}
```

- [ ] **Step 6: Run content and ownership tests**

Run: `pnpm vitest run scripts/lib/service-area-landings.test.ts scripts/lib/seo-keyword-targets.test.ts && pnpm seo:validate-targets`

Expected: PASS and all five activated owner paths resolve from the same approved content records.

- [ ] **Step 7: Commit first local landing content**

```bash
git add content/sorouh/service-area-landings.ts content/sorouh/seo/keyword-targets.ts scripts/lib/service-area-landings.test.ts scripts/seed-sorouh.ts scripts/validate-seo-keyword-targets.ts
git commit -m "feat: add first data-approved local landing content"
```

### Task 7: Managed Expansion Patch and Sanity Publication

**Files:**
- Create: `scripts/lib/build-seo-expansion-patches.ts`
- Create: `scripts/lib/build-seo-expansion-patches.test.ts`
- Create: `scripts/apply-seo-expansion.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `buildSeoExpansionPatches(input): ManagedPatch[]` for home featured services and area featured services.
- CLI modes: exactly one of `--dry-run` or `--apply`.

- [ ] **Step 1: Write failing pure patch tests**

```ts
test('adds new service references once and preserves unrelated references', () => {
  const patches = buildSeoExpansionPatches({
    homePage: { featuredServices: [{ _ref: 'service-general-contracting' }] },
    areas: [{ _id: 'area-dammam', featuredServices: [{ _ref: 'service-general-contracting' }] }],
    featuredServiceIds: ['service-roof-insulation', 'service-annex-construction'],
  })
  expect(patches[0]!.set.featuredServices.map((item) => item._ref)).toEqual([
    'service-general-contracting', 'service-roof-insulation', 'service-annex-construction',
  ])
  expect(new Set(patches[1]!.set.featuredServices.map((item) => item._ref)).size).toBe(3)
})
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `pnpm vitest run scripts/lib/build-seo-expansion-patches.test.ts`

Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement deterministic reference merging**

The pure function must preserve existing order, append missing reviewed IDs, create stable `_key` values from each ID, and never remove an unrelated reference. Return patches for `homePage` and every area.

- [ ] **Step 4: Implement guarded Sanity CLI**

Copy the project/dataset guard pattern from `apply-semantic-media.ts`. The dry-run output must contain only counts and IDs, not tokens. The apply mode must fetch current documents, build a transaction, commit with `visibility: 'sync'`, refetch, and assert every expected reference once.

Add scripts:

```json
"seo:expand:dry": "pnpm --dir studio exec sanity exec ../scripts/apply-seo-expansion.ts --with-user-token -- --dry-run",
"seo:expand": "pnpm --dir studio exec sanity exec ../scripts/apply-seo-expansion.ts --with-user-token -- --apply"
```

- [ ] **Step 5: Run unit tests and Sanity dry-runs**

Run: `pnpm vitest run scripts/lib/build-seo-expansion-patches.test.ts`

Expected: PASS.

Run: `pnpm seed:sorouh --dry-run`

Expected: reports the four new services and five local landing documents as missing before publication.

Run: `pnpm seo:expand:dry`

Expected: reports intended home/area patch counts without mutation.

- [ ] **Step 6: Publish schema, seed missing documents, and apply managed relationships**

Run in order:

```bash
pnpm check:schema
pnpm --dir studio deploy
pnpm seed:sorouh
pnpm seo:expand
```

Expected: schema deploy succeeds; missing documents are created once; the patch verifies home/area references; the Sanity webhook starts a Cloudflare rebuild.

- [ ] **Step 7: Commit code and script changes**

```bash
git add package.json scripts/lib/build-seo-expansion-patches.ts scripts/lib/build-seo-expansion-patches.test.ts scripts/apply-seo-expansion.ts
git commit -m "feat: publish managed SEO content expansion"
```

### Task 8: Production Verification for Expanded Content

**Files:**
- Modify: `scripts/verify-production.ts`
- Modify: `scripts/verify-production.test.ts`
- Modify: `docs/release-checklist.md`

**Interfaces:**
- Consumes: production sitemap and selected new URLs.
- Produces: failure if a new service or local landing is missing, noindex, or canonically wrong.

- [ ] **Step 1: Add failing production checks**

Add selected URLs:

```ts
const REQUIRED_SEO_URLS = [
  '/الخدمات/عزل-الاسطح/',
  '/الخدمات/كشف-ومعالجة-تسربات-المياه/',
  '/الخدمات/بناء-الملاحق/',
  '/الخدمات/الهدم-والازالة/',
  '/الخدمات/ترميم-منازل-وفلل/الدمام/',
] as const
```

For each, require status 200, self-canonical, `index, follow`, one H1, and sitemap presence.

- [ ] **Step 2: Run the test and confirm fixture failure**

Run: `pnpm vitest run scripts/verify-production.test.ts`

Expected: FAIL until the mock responses include the required URLs.

- [ ] **Step 3: Complete the verification implementation and fixtures**

Use the existing `request` injection, decode paths safely, and print only URL/status assertions. Extend mock HTML with one H1, canonical, and robots metadata.

- [ ] **Step 4: Run full local quality**

Run: `pnpm check`

Expected: PASS with dynamic service count, new schema, route family, sitemap, and media.

Run: `pnpm test:e2e`

Expected: PASS on desktop/mobile and no overflow on the new route template.

- [ ] **Step 5: Wait for the Cloudflare rebuild and verify production**

Run: `pnpm verify:production`

Expected: PASS for every required new URL.

- [ ] **Step 6: Update inventory evidence and commit**

Update `docs/release-checklist.md` from generated/build evidence rather than a hard-coded lifetime promise.

```bash
git add scripts/verify-production.ts scripts/verify-production.test.ts docs/release-checklist.md
git commit -m "test: verify expanded SEO routes in production"
```
