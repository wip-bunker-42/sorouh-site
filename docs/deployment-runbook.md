# دليل النشر والرجوع

## Sanity

المشروع `ki7bs4vk` وdataset `production`. افحص `sanity schemas validate` ثم extract وTypeGen و`sanity schemas deploy`. Studio منشور على `sorouh-studio.sanity.studio` ومعرف التطبيق محفوظ في `sanity.cli.ts`.

## Cloudflare

Worker اسمه `sorouh-site`، Static Assets فقط، `force-trailing-slash` و404 page. نفّذ build ثم `wrangler deploy --dry-run` ثم deploy. ملفات `_headers` تعطي HTML revalidation وأصول Astro immutable.

إعدادات Dashboard الخارجية: Always Use HTTPS، apex custom domain، سجل `www` proxied وBulk Redirect 301 إلى apex مع الحفاظ على path/query، Crawler Hints، ثم Search Console وBing وإرسال `https://sorouh.site/sitemap.xml`. لا تضع قواعد host/HTTPS داخل `_redirects`.

GTM معطل افتراضيًا. للتفعيل ضع `PUBLIC_GTM_ID=GTM-...` في بيئة البناء وأعد build؛ أي قيمة غير صحيحة توقف البناء. راجع متطلبات الخصوصية قبل إضافة Tags تجمع بيانات أو Cookies.

للرجوع استخدم `wrangler versions list` ثم `wrangler rollback <VERSION_ID>`. في Sanity أعد نشر النسخة الصحيحة من History، ثم أعد بناء الموقع.
