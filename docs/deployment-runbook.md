# دليل النشر والرجوع

## Sanity

المشروع `ki7bs4vk` وdataset `production`. افحص `sanity schemas validate` ثم extract وTypeGen و`sanity schemas deploy`. Studio منشور على `sorouh-studio.sanity.studio` ومعرف التطبيق محفوظ في `sanity.cli.ts`.

عند دمج تغيير يمس `studio/` في `main` يشغّل GitHub Actions الأمر `sanity deploy --yes --schema-required`. المصادقة داخل Environment اسمه `sanity-production` عبر `SANITY_AUTH_TOKEN` محدود بدور `deploy-studio`، ومعه `SANITY_STUDIO_PROJECT_ID` و`SANITY_STUDIO_DATASET`. يمكن إعادة النشر يدويًا من تبويب Actions عبر `workflow_dispatch`.

يراجع `Deploy Cloudflare` محتوى dataset `production` بجدول كل 15 دقيقة عبر Sanity API العام، ويقارن بصمة معرفات ومراجعات المستندات المنشورة ببصمة آخر نشر ناجح المحفوظة في Actions Cache. يشمل الفحص أصول الصور والملفات المشار إليها في المحتوى المنشور فقط. عند Publish أو Unpublish أو حذف محتوى منشور تتغير البصمة ويُعاد البناء والنشر. المسودات ونسخ Content Releases غير المنشورة ورفع أصل غير مستخدم لا تشغّل البناء. الجدول يخضع لتأخير طابور GitHub Actions ولا يضمن النشر الفوري.

هذا المسار لا يحتاج مفتاح Sanity أو تعديل Webhook. إذا اختفت نسخة Cache، ينفذ نشرًا واحدًا لتأسيس البصمة. لا تُحفظ بصمة جديدة إلا بعد نجاح النشر وفحص الإنتاج؛ فشل Sanity API يوقف الفحص ويظهر الخطأ بدل اعتبار المحتوى ثابتًا.

للتشغيل الفوري الاختياري يمكن إعداد Webhook داخل Sanity يستخدم `POST https://api.github.com/repos/wip-bunker-42/sorouh-site/dispatches` مع جسم JSON ثابت `{"event_type":"sanity-content-update"}` وheader باسم `Accept` بقيمة `application/vnd.github+json` و`Authorization: Bearer <GITHUB_DISPATCH_TOKEN>`. يحتاج GitHub token إلى صلاحية `Contents: write` على هذا المستودع فقط، ويُحفظ داخل إعداد Webhook السري لا في الكود. يمكن استخدام وسيط يتحقق من توقيع Sanity ثم يرسل الطلب نفسه إلى GitHub بدلًا من إعطاء Sanity توكن GitHub. توكن Cloudflare لا يصلح للمصادقة على GitHub. تُراجع Delivery Logs للتأكد من استجابة GitHub برمز `204` وبدء `Deploy Cloudflare` بنوع الحدث `repository_dispatch`.

## Cloudflare

Worker اسمه `sorouh-site`، Static Assets فقط، `force-trailing-slash` و404 page. نفّذ build ثم `wrangler deploy --dry-run` ثم deploy. ملفات `_headers` تعطي HTML revalidation وأصول Astro immutable.

الإنتاج مؤتمت عبر Workflow باسم `Deploy Cloudflare` في مستودع `wip-bunker-42/sorouh-site` العام، داخل حساب Cloudflare «الصروح». يثبت GitHub Actions الأدوات على Node 24 وpnpm 11.11.0 ويستخدم lockfile وإصدار Wrangler المثبت في المشروع. تُحفظ القيمتان التاليتان في Repository Secrets داخل GitHub:

- `CLOUDFLARE_API_TOKEN`: توكن Cloudflare المخصص للنشر.
- `CLOUDFLARE_ACCOUNT_ID`: `9cf696f32c3e4c0ff376ecdc92ab28a0`.

تصل أسرار Cloudflare إلى خطوة `pnpm --dir web deploy` فقط. فحوص Pull Requests لا تحصل عليها. تظل أسرار نشر Sanity داخل Environment باسم `sanity-production`.

بعد نجاح `CI` لحدث `push` على `main` من المستودع نفسه، يختار Workflow نفس commit الذي اجتاز الفحص ويعيد بناء المحتوى المنشور من Sanity، ثم يشغّل Wrangler dry-run وينشر. لا يقبل نتيجة CI لطلب سحب، ولا ينزّل artifacts من فحوص طلبات السحب. النشر متسلسل ولا يُلغى نشر جارٍ عند وصول تحديث جديد. يُراجع رأس `main` عند بدء التشغيل وقبل النشر مباشرة؛ إذا تجاوزه commit أحدث يتخطى النشر القديم، ويُترك النشر لتشغيل commit الأحدث بعد نجاح فحصه.

لإعادة النشر افتح Actions ثم `Deploy Cloudflare` ثم `Run workflow` واختر `main`. إعادة البناء من Sanity تستخدم الحدث `repository_dispatch` من النوع `sanity-content-update` دون قبول اسم فرع أو SHA من جسم الطلب. المساران اليدوي والمحتوى يشغّلان `pnpm check` واختبارات Chromium وWrangler dry-run قبل النشر، حتى إذا لم يسبقهما تشغيل CI. بعد النشر يشغّل Workflow `pnpm verify:production` للتأكد من canonical وsitemaps وتحويل `www`؛ ويستمر `Production Check` اليومي مستقلًا.

عند التحويل من Workers Builds، تحقق من نجاح النشر الجديد ثم عطّل Production Trigger القديم وDeploy Hook باسم `Sanity Production Publish` واحذف Webhook القديم من Sanity. مراقبة المحتوى المجدولة تستبدل ذلك الربط؛ إعداد GitHub dispatch فوري اختياري. لا يلزم اتصال Git أو تثبيت تطبيق Cloudflare على منظمة GitHub لهذا المسار. عند نقل المستودع لاحقًا، حدّث عنوان GitHub dispatch والمصادقة والأسرار، مع إبقاء اسم Worker والدومين كما هما.

تم ربط apex كـcustom domain، وتفعيل Always Use HTTPS وCrawler Hints، وإبقاء سجل `www` proxied مع Redirect Rule 301 إلى apex يحفظ path/query. تم أيضًا تعطيل Cloudflare Managed robots.txt وAI/content crawler blocking حتى يصل ملف الموقع السامح لجميع الروبوتات بلا حقن أو حجب. تُضاف الملكية من حسابات Search Console وBing ويُرسل `https://sorouh.site/sitemap.xml`. لا تضع قواعد host/HTTPS داخل `_redirects`.

GTM معطل افتراضيًا. للتفعيل اتبع [إعداد GA4 وGTM](analytics-setup.md)، ثم ضع `PUBLIC_GTM_ID=GTM-...` في بيئة البناء وأعد build؛ أي قيمة غير صحيحة توقف البناء. راجع متطلبات الخصوصية قبل إضافة Tags تجمع بيانات أو Cookies.

للرجوع استخدم `wrangler versions list` ثم `wrangler rollback <VERSION_ID>`. في Sanity أعد نشر النسخة الصحيحة من History، ثم أعد بناء الموقع.
