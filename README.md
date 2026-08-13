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

متغيرات الواجهة: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET=production`، و`PUBLIC_GTM_ID` اختياري. القيمة الفارغة تعني أن GTM معطل تمامًا.

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

راجع [دليل المحرر](docs/editor-guide-ar.md)، [دليل النشر](docs/deployment-runbook.md)، [المراجعة البصرية](docs/visual-review.md)، و[قائمة العميل الجديد](docs/new-client-checklist.md).
