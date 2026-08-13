# Sorouh Contractor Starter

قالب برمجي reusable لمواقع المقاولات العربية مبني بـ Astro + TypeScript + Sanity + Cloudflare Workers Static Assets. مشروع صروح هو أول implementation للقالب؛ المحتوى الخاص به معزول داخل `content/sorouh` ولا يُنسخ لعميل جديد.

## التشغيل

يتطلب Node 22.12+ وpnpm 11.11.0. انسخ ملفات `.env.example` إلى `.env` داخل `web` و`studio` ثم:

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

متغيرات الواجهة: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET=production`، `PUBLIC_SITE_ORIGIN`، و`PUBLIC_GTM_ID` اختياري. القيمة الفارغة تعني أن GTM معطل تمامًا.

## المحتوى والنشر

```bash
pnpm seed:sorouh --dry-run
pnpm seed:sorouh
pnpm --dir studio typegen
pnpm --dir studio deploy
pnpm --dir web deploy:dry
pnpm --dir web deploy
```

Seed صروح create-missing: لا يكتب فوق تغييرات المحرر. بيانات API تستخدم الإصدار الثابت `2026-08-13`. ينتج Astro HTML ثابتًا وcanonical ذاتيًا وsitemaps وRSS وrobots وllms وredirects داخل build.

## الجودة

`pnpm check` للفورمات والأنواع والـschema وTypeGen والوحدات والبناء. `pnpm test:e2e` يشغّل Chromium desktop/mobile وAxe. القائمة والـCTA والمشاركة تعمل دون اعتماد المحتوى الأساسي على JavaScript.

## الأتمتة

- `CI` يعمل على `main` وكل Pull Request: تثبيت مقفل، تدقيق ثغرات متوسطة فأعلى، الفحص الكامل، Wrangler dry-run، واختبارات Chromium للديسكتوب والموبايل.
- `Deploy Sanity Studio` يعمل عند تغييرات `studio/` على `main` وينشر Studio والـSchema إلى `sorouh-studio.sanity.studio` باستخدام GitHub Environment باسم `sanity-production`.
- Cloudflare Workers Builds مرتبط مباشرة بالمستودع وينشر `sorouh-site` تلقائيًا من `main` بتوكن Cloudflare مخصص؛ لا تُخزن أسرار Cloudflare في GitHub لهذا المسار.
- Webhook باسم `Cloudflare Production Rebuild` يعيد بناء الموقع عند نشر أو تحديث أو حذف محتوى `production` في Sanity؛ تعديلات المسودة وحدها لا تنشر الموقع.
- `pnpm verify:production` يفحص الدومين الأساسي وcanonical وsitemaps وتحويل `www` بعد النشر.
- `Production Check` يعيد فحص الإنتاج يوميًا ويمكن تشغيله يدويًا من Actions.
- Dependabot يراجع pnpm وGitHub Actions أسبوعيًا، ولا يدمج تحديثات تلقائيًا.

راجع [دليل المحرر](docs/editor-guide-ar.md)، [دليل النشر](docs/deployment-runbook.md)، [المراجعة البصرية](docs/visual-review.md)، و[قائمة العميل الجديد](docs/new-client-checklist.md).
