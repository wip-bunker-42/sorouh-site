# Release checklist — Sorouh

- [x] 17 خدمة و10 مناطق و11 مشروعًا و5 مقالات و5 صفحات خدمة محلية منشورة في Sanity.
- [x] 56 صفحة HTML ثابتة، canonical فريد، JSON-LD، breadcrumbs، و0 صفحات يتيمة.
- [x] Sitemap index/pages/videos وRSS وrobots وllms وقت البناء.
- [x] صور responsive عبر Sanity CDN مع `auto=format` وalt وأبعاد.
- [x] YouTube iframe حقيقي وlazy أسفل المقدمة.
- [x] اتصال وواتساب فقط؛ الرقم الأساسي والاحتياطي.
- [x] GTM اختياري ومعطل في أول نشر.
- [x] 180 unit tests و7 build tests و24 browser tests وAxe desktop/mobile.
- [x] GitHub Actions يشغّل التحقق الكامل وWrangler dry-run على `main` وكل Pull Request.
- [x] نشر Sanity Studio والـSchema مؤتمت من `main` بتوكن `deploy-studio` محدود داخل GitHub Environment.
- [x] Dependabot أسبوعي لاعتماديات pnpm وGitHub Actions.
- [x] Production Check يومي ويدوي لـcanonical وsitemaps وتحويل `www`.
- [x] Wrangler dry-run Static Assets فقط.
- [x] Sanity Schema وStudio منشوران.
- [x] ربط apex بـWorkers Static Assets بعد إزالة سجل DNS القديم المتعارض.
- [x] www → apex بحالة 301 مع حفظ المسار والاستعلام، وتفعيل Always Use HTTPS.
- [x] تعطيل Cloudflare Managed robots.txt وحماية/حجب روبوتات المحتوى حتى يبقى `robots.txt` سامحًا لجميع الروبوتات كما هو معتمد.
- [x] تفعيل Crawler Hints للنطاق؛ أكدت Cloudflare تطبيق `crawlhints_enabled=true`.
- [x] ربط Search Console وBing وإرسال `https://sorouh.site/sitemap.xml` من حساب المالك.
- [x] نشر 5 صفحات محلية معتمدة والتحقق الخارجي من 9 نقاط تشمل الـcanonical والـsitemap والصفحات الجديدة.
- [x] إعداد الحسابين القائمين GA4 وGTM؛ وصول الاتصال وواتساب ومعلمات الخدمة والمدينة إلى DebugView في معاينة 28 سبتمبر 2026.

## إصدار تحسين الخدمات — 28 سبتمبر 2026

- [x] محتوى مؤهل للخدمات المعتمدة، تحسين 9 صفحات في الدمام والخبر، وروابط داخلية من الرئيسية والمقالات والمشاريع.
- [x] خطة CMS محمية بمراجعات المستندات ونسخ أصلية ومسودات استرجاع؛ 43 تعديلًا و5 صفحات مسحوبة في المعاينة.
- [x] إزالة ساعات العمل والإحصاءات غير المثبتة، وإزالة ادعاء الليزر من النص مع حفظ الرابط القديم.
- [x] سياق واتساب حسب الصفحة، وتسجيل نقرة واحدة لكل تفاعل دون بيانات الرسالة أو الهاتف.
- [x] 234 اختبارًا، وفحص TypeScript وSchema وبناء معاينة CMS؛ 66 صفحة قابلة للفهرسة و0 صفحات يتيمة.
- [x] إصلاح حجز صورة المقدمة على الجوال والخط الاختياري وتحسين تباين النص فوق الخلفية الداكنة.
- [ ] اكتمال CI ونشر الواجهة وتطبيق خطة CMS والتحقق من الإنتاج.
- [ ] ضبط `PUBLIC_GTM_ID` في Cloudflare ونشر إصدار GTM والتحقق من تتبع الإنتاج.
