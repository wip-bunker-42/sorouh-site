# Release checklist — Sorouh

- [x] 13 خدمة و10 مناطق و11 مشروعًا و5 مقالات منشورة في Sanity.
- [x] 47 صفحة HTML ثابتة، canonical فريد، JSON-LD، breadcrumbs.
- [x] Sitemap index/pages/videos وRSS وrobots وllms وقت البناء.
- [x] صور responsive عبر Sanity CDN مع `auto=format` وalt وأبعاد.
- [x] YouTube iframe حقيقي وlazy أسفل المقدمة.
- [x] اتصال وواتساب فقط؛ الرقم الأساسي والاحتياطي و24/7.
- [x] GTM اختياري ومعطل في أول نشر.
- [x] 128 unit tests و6 build tests و18 browser tests وAxe desktop/mobile.
- [x] Wrangler dry-run Static Assets فقط.
- [x] Sanity Schema وStudio منشوران.
- [x] ربط apex بـWorkers Static Assets بعد إزالة سجل DNS القديم المتعارض.
- [x] www → apex بحالة 301 مع حفظ المسار والاستعلام، وتفعيل Always Use HTTPS.
- [x] تعطيل Cloudflare Managed robots.txt وحماية/حجب روبوتات المحتوى حتى يبقى `robots.txt` سامحًا لجميع الروبوتات كما هو معتمد.
- [x] تفعيل Crawler Hints للنطاق؛ أكدت Cloudflare تطبيق `crawlhints_enabled=true`.
- [ ] إضافة ملكية Search Console/Bing وإرسال `https://sorouh.site/sitemap.xml` من حسابات المالك.
