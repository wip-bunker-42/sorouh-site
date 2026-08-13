# دليل النشر والرجوع

## Sanity

المشروع `ki7bs4vk` وdataset `production`. افحص `sanity schemas validate` ثم extract وTypeGen و`sanity schemas deploy`. Studio منشور على `sorouh-studio.sanity.studio` ومعرف التطبيق محفوظ في `sanity.cli.ts`.

## Cloudflare

Worker اسمه `sorouh-site`، Static Assets فقط، `force-trailing-slash` و404 page. نفّذ build ثم `wrangler deploy --dry-run` ثم deploy. ملفات `_headers` تعطي HTML revalidation وأصول Astro immutable.

تم ربط apex كـcustom domain، وتفعيل Always Use HTTPS، وإبقاء سجل `www` proxied مع Redirect Rule 301 إلى apex يحفظ path/query. تم أيضًا تعطيل Cloudflare Managed robots.txt وAI/content crawler blocking حتى يصل ملف الموقع السامح لجميع الروبوتات بلا حقن أو حجب. تظل Crawler Hints خطوة Dashboard لأن OpenAPI الحالي لا يعرض إعدادًا لها، ثم تُضاف الملكية من حسابات Search Console وBing ويُرسل `https://sorouh.site/sitemap.xml`. لا تضع قواعد host/HTTPS داخل `_redirects`.

GTM معطل افتراضيًا. للتفعيل ضع `PUBLIC_GTM_ID=GTM-...` في بيئة البناء وأعد build؛ أي قيمة غير صحيحة توقف البناء. راجع متطلبات الخصوصية قبل إضافة Tags تجمع بيانات أو Cookies.

للرجوع استخدم `wrangler versions list` ثم `wrangler rollback <VERSION_ID>`. في Sanity أعد نشر النسخة الصحيحة من History، ثم أعد بناء الموقع.
