# دليل النشر والرجوع

## Sanity

المشروع `ki7bs4vk` وdataset `production`. افحص `sanity schemas validate` ثم extract وTypeGen و`sanity schemas deploy`. Studio منشور على `sorouh-studio.sanity.studio` ومعرف التطبيق محفوظ في `sanity.cli.ts`.

عند دمج تغيير يمس `studio/` في `main` يشغّل GitHub Actions الأمر `sanity deploy --yes --schema-required`. المصادقة داخل Environment اسمه `sanity-production` عبر `SANITY_AUTH_TOKEN` محدود بدور `deploy-studio`، ومعه `SANITY_STUDIO_PROJECT_ID` و`SANITY_STUDIO_DATASET`. يمكن إعادة النشر يدويًا من تبويب Actions عبر `workflow_dispatch`.

عند نشر أو تحديث أو حذف وثيقة منشورة في dataset `production`، يرسل Sanity Webhook باسم `Cloudflare Production Rebuild` طلبًا إلى Cloudflare Deploy Hook باسم `Sanity Production Publish` لإعادة بناء `main`. المسودات ونسخ Content Releases غير المنشورة لا تشغّل البناء؛ يبدأ النشر فقط عند الضغط على Publish أو Unpublish.

## Cloudflare

Worker اسمه `sorouh-site`، Static Assets فقط، `force-trailing-slash` و404 page. نفّذ build ثم `wrangler deploy --dry-run` ثم deploy. ملفات `_headers` تعطي HTML revalidation وأصول Astro immutable.

الإنتاج مؤتمت عبر Cloudflare Workers Builds المرتبط بمستودع `aim9sour/sorouh-site`. Production Trigger يراقب `main`، ويترك لمنصة Builds تثبيت الاعتماديات من lockfile ثم يبني من جذر المستودع بـ`pnpm --filter @sorouh/web build` وينشر بـ`pnpm --dir web deploy`. متغيرا البناء `NODE_VERSION=24` و`PNPM_VERSION=11.11.0` يثبتان بيئة الأدوات، ومتغيرات Sanity العامة تضبط مصدر المحتوى. بعد كل نشر شغّل `pnpm verify:production` أو Workflow التحقق للتأكد من canonical وsitemaps وتحويل `www`.

تم ربط apex كـcustom domain، وتفعيل Always Use HTTPS وCrawler Hints، وإبقاء سجل `www` proxied مع Redirect Rule 301 إلى apex يحفظ path/query. تم أيضًا تعطيل Cloudflare Managed robots.txt وAI/content crawler blocking حتى يصل ملف الموقع السامح لجميع الروبوتات بلا حقن أو حجب. تُضاف الملكية من حسابات Search Console وBing ويُرسل `https://sorouh.site/sitemap.xml`. لا تضع قواعد host/HTTPS داخل `_redirects`.

GTM معطل افتراضيًا. للتفعيل اتبع [إعداد GA4 وGTM](analytics-setup.md)، ثم ضع `PUBLIC_GTM_ID=GTM-...` في بيئة البناء وأعد build؛ أي قيمة غير صحيحة توقف البناء. راجع متطلبات الخصوصية قبل إضافة Tags تجمع بيانات أو Cookies.

للرجوع استخدم `wrangler versions list` ثم `wrangler rollback <VERSION_ID>`. في Sanity أعد نشر النسخة الصحيحة من History، ثم أعد بناء الموقع.
