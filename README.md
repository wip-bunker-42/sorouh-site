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
- `Deploy Cloudflare` ينشر `sorouh-site` من GitHub Actions بعد نجاح `CI` على آخر commit في `main`. يستخدم `CLOUDFLARE_API_TOKEN` و`CLOUDFLARE_ACCOUNT_ID` من GitHub Secrets داخل خطوة النشر فقط، ثم يفحص الإنتاج. لا يحتاج هذا المسار إلى ربط Git داخل Cloudflare.
- يمكن تشغيل `Deploy Cloudflare` يدويًا على `main` أو بإرسال `repository_dispatch` من النوع `sanity-content-update`. يعيدان الفحص الكامل واختبارات المتصفح قبل النشر؛ نشر Pull Requests غير متاح.
- يراجع GitHub محتوى Sanity المنشور بجدول كل 15 دقيقة باستخدام القراءة العامة، وينشر عند تغيره فقط. لا يحتاج مفتاح Sanity أو Webhook؛ المسودات وContent Releases غير المنشورة والأصول غير المستخدمة لا تغيّر البصمة. تُحفظ بصمة آخر نشر ناجح فقط في Actions Cache.
- `pnpm verify:production` يفحص الدومين الأساسي وcanonical وsitemaps وتحويل `www` بعد النشر.
- `Production Check` يعيد فحص الإنتاج يوميًا ويمكن تشغيله يدويًا من Actions.
- Dependabot يراجع pnpm وGitHub Actions أسبوعيًا، ولا يدمج تحديثات تلقائيًا.

راجع [دليل المحرر](docs/editor-guide-ar.md)، [دليل النشر](docs/deployment-runbook.md)، [المراجعة البصرية](docs/visual-review.md)، و[قائمة العميل الجديد](docs/new-client-checklist.md).
