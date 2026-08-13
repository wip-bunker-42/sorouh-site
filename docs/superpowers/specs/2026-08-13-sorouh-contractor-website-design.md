# مواصفات موقع شركة صروح الشرقية للمقاولات

**الحالة:** معتمد للتخطيط التنفيذي

**التاريخ:** 13 أغسطس 2026

**الدومين الأساسي:** `https://sorouh.site`

**اللغة:** العربية السعودية فقط (`ar-SA`، اتجاه RTL)

## 1. الهدف وحدود النجاح

نبني موقعًا عربيًا احترافيًا لشركة صروح الشرقية للمقاولات باستخدام Astro وTypeScript وSanity، ويُنشر كموقع ثابت على Cloudflare Workers Static Assets. الهدف التجاري هو تحويل الزيارات المحلية في المنطقة الشرقية إلى مكالمات ومحادثات واتساب، مع تأسيس تقني ومحتوى قوي للظهور في Google وBing ومحركات الإجابة مثل ChatGPT وClaude.

الموقع ليس Page Builder ولا نظام سحب وإفلات. هو Code Starter نعيد استخدام بنيته البرمجية أنا والمالك لإنتاج مواقع مستقلة لعملاء جدد بسرعة، مع كتابة هوية ومحتوى أصلي لكل عميل. لا يوجد Multi-tenancy، ولا قاعدة محتوى مشتركة، ولا إعادة تدوير لمقالات SEO بين العملاء.

لا يتضمن نطاق النجاح وعدًا بالمركز الأول؛ الترتيب يتأثر أيضًا بالمنافسة وعمر الدومين والروابط وملف Google Business Profile، وهو غير موجود حاليًا. النجاح التقني يعني:

- صفحات ثابتة سريعة وقابلة للزحف والفهرسة دون JavaScript.
- بنية محتوى محلية تمنع الصفحات الرقيقة والمتكررة.
- مسار تحويل واضح للاتصال والواتساب على الهاتف والكمبيوتر.
- استقلال ملكية كل عميل وسهولة تسليمه وصيانته.
- اجتياز اختبارات البناء وSEO والوصول قبل النشر.

## 2. حقائق الشركة المعتمدة

- الاسم: شركة صروح الشرقية للمقاولات.
- النشاط: مقاولات عامة وخدمات بناء وترميم وتشطيب.
- نموذج العمل المحلي: Service Area Business دون عنوان معلن أو مقر يستقبل العملاء.
- ساعات التواصل: 24 ساعة يوميًا، طوال أيام الأسبوع.
- الرقم الأساسي للاتصال والواتساب: `0546121683`، ويُحوّل برمجيًا إلى الصيغة الدولية `+966546121683`.
- الرقم الاحتياطي للاتصال والواتساب: `0546745928`، ويُحوّل إلى `+966546745928`.
- البريد المعتمد لخلاصة RSS هو `info@sorouh.site`. لا نعرضه كوسيلة CTA ولا نضيف نموذج مراسلة؛ التواصل الظاهر يظل اتصالًا وواتساب فقط.
- لا يوجد Google Business Profile، تقييمات موثقة، أو عنوان. لا نختلق أيًا منها.
- أرقام الثقة المقدمة من الشركة:
  - أكثر من 75 مشروعًا منجزًا.
  - أكثر من 180,000 م² أعمال منفذة.
  - 94% تسليم ضمن الجدول الزمني.
  - أكثر من 35 عميلًا تمت خدمتهم.
- الكاتب والناشر لكل المقالات: شركة صروح الشرقية للمقاولات.

## 3. المعمارية

### 3.1 المستودع والتطبيقات

مستودع GitHub خاص واحد يحتوي مشروعين مستقلين في Monorepo بسيط:

- `web/`: موقع Astro العام.
- `studio/`: Sanity Studio مستقل.
- `scripts/`: أدوات البناء، التحقق، الاستيراد، وتوليد الملفات التقنية.
- `content/sorouh/`: محتوى الاستيراد الخاص بصروح فقط، ولا يدخل في Starter عام يُنسخ لعميل آخر.

لا نضيف Workspace framework أو طبقات نشر لا يحتاجها المشروع. نستخدم مدير حزم واحدًا وملف lock واحدًا إذا أثبت إعداد Astro وSanity الحالي توافقه، وإلا يحتفظ كل تطبيق بإدارة تبعياته المستقلة حسب توثيق Sanity.

### 3.2 الواجهة العامة

- Astro بنمط SSG كامل؛ كل الصفحات تُولّد وقت البناء من محتوى Sanity المنشور.
- TypeScript بوضع صارم، مثبت مؤقتًا على `6.0.3` لأن `astro check` الحالي يعتمد على Compiler Programmatic API غير المتاحة في TypeScript 7 native. لا نرقّي إلى 7 حتى يعلن Astro دعم checker رسميًا وتجتاز بوابة الجودة كاملة.
- `site: "https://sorouh.site"` و`trailingSlash: "always"` ثابتان في إعداد Astro، لكي تولّد الروابط الداخلية والـcanonical والـsitemap بصيغة الشرطة المائلة نفسها.
- لا نستخدم Astro Cloudflare Adapter ولا SSR ولا Worker script؛ مجلد `dist` هو الأصل المنشور.
- محتوى الصفحات الأساسي، روابط التنقل، الفيديوهات، البيانات المنظمة والـmetadata موجودة في HTML الناتج.
- JavaScript للمتصفح يُستخدم فقط للتفاعلات الضرورية الصغيرة، مثل فتح قائمة الهاتف ونسخ رابط المقال. لا توجد مكتبة UI ثقيلة.

### 3.3 Sanity

- لكل عميل Sanity Project مستقل بالكامل، وdataset مستقل باسم `production`.
- مشروع Sanity الخاص بصروح منشأ بالفعل؛ التنفيذ يقرأ Project ID الموجود ويتحقق من dataset `production` قبل أي seed، ولا ينشئ Project جديدًا.
- Studio صروح يُنشر عبر `sanity deploy` على عنوان `*.sanity.studio` فريد.
- الدخول للعميل من خلال عضوية Sanity وصلاحياته؛ لا توجد واجهة إدارة مخصصة أو مصادقة من صنعنا.
- نستخدم `defineType` و`defineField` و`defineArrayMember`، وreferences للعلاقات القابلة لإعادة الاستخدام، وobjects للبيانات التابعة للوثيقة.
- نستخدم GROQ queries مركزية عبر `defineQuery`، وSanity TypeGen لتوليد أنواع TypeScript بدل تكرارها يدويًا.
- كل Sanity clients تستخدم `apiVersion: "2026-08-13"` كسلسلة ثابتة. لا نستخدم `new Date()` لتغيير نسخة API تلقائيًا؛ تُرقّى النسخة فقط بقرار واختبار مقصودين.
- `useCdn: false` أثناء البناء لضمان أن النشر يرى أحدث محتوى منشور.
- الفيديو يُخزّن كرابط YouTube وبيانات وصفية فقط؛ لا نرفع فيديو إنتاجي إلى Sanity Assets.

### 3.4 Cloudflare

- الموقع العام يُنشر على Cloudflare Workers Static Assets من `web/dist`.
- `wrangler.jsonc` لا يحتوي `main` لأن الموقع ثابت ولا يحتاج Worker runtime.
- `assets.not_found_handling` مضبوط على `"404-page"` و`assets.html_handling` مضبوط على `"force-trailing-slash"`. Cloudflare هو الذي يخدم HTML ويحوّل صيغ URL غير المطابقة إلى الصيغة ذات الشرطة المائلة.
- Workers Builds متصل بالمستودع الخاص: فرع `main` للإنتاج، وبقية الفروع لنسخ المعاينة. نضبط `workers_dev: false` لمسار الإنتاج، و`preview_urls: true` للمعاينات فقط.
- Preview URLs على `workers.dev` تبقى عامة وفق قرار المشروع، ولا تحتاج عمل مصادقة ضمن النطاق.
- Sanity webhook يستدعي Workers Deploy Hook عند publish أو unpublish أو delete لمحتوى يؤثر في الموقع.
- الدومين الأساسي هو النسخة غير `www`: `https://sorouh.site`. تفعيل Always Use HTTPS في Cloudflare يحوّل HTTP إلى HTTPS، وBulk Redirect على مستوى zone يحوّل `www.sorouh.site` إلى `sorouh.site` بحالة `301` مع `Subpath matching` و`Preserve path suffix` و`Preserve query string`. يُنشأ سجل DNS proxied لـ`www` حتى تصل الطلبات إلى قاعدة التحويل.
- تحويلات البروتوكول والـhost تتم في Cloudflare قبل الموقع ولا تدخل ملف `_redirects`. ملف `_redirects` مخصص فقط لتغيير slugs والمسارات الداخلية.
- يُفعّل Crawler Hints من إعدادات Cloudflare؛ لا نبني تكامل IndexNow مخصصًا.
- Sanity Studio لا يُنشر على Cloudflare؛ يُنشر فقط عبر استضافة Sanity المدمجة.

## 4. خريطة الصفحات وعناوين URL

كل الروابط canonical تنتهي بشرطة مائلة واحدة، وتُستخدم slugs عربية نظيفة وفريدة:

- `/` الرئيسية.
- `/من-نحن/` من نحن.
- `/الخدمات/` فهرس الخدمات.
- `/الخدمات/[slug]/` لكل خدمة.
- `/مشاريعنا/` فهرس المشاريع.
- `/مشاريعنا/[slug]/` صفحة مشروع عندما يملك عنوانًا ووصفًا فريدًا وخدمة ومنطقة مرتبطتين ووسيطًا واحدًا على الأقل (صورة أو فيديو). المشروع الذي لا يستوفي هذه الحقول يظهر في الفهرس فقط دون صفحة رقيقة.
- `/مناطق-الخدمة/` فهرس المناطق.
- `/مناطق-الخدمة/[slug]/` لكل منطقة.
- `/المدونة/` فهرس المقالات.
- `/المدونة/[slug]/` لكل مقال.
- `/اتصل-بنا/` الاتصال والواتساب فقط.
- `/404.html` صفحة الخطأ المخصصة.
- `/rss.xml` خلاصة المقالات.
- `/sitemap.xml` فهرس خرائط الموقع.
- `/sitemap-pages.xml` الصفحات والصور القابلة للفهرسة.
- `/sitemap-videos.xml` الصفحات التي تحتوي فيديوهات مؤهلة للفهرسة.
- `/robots.txt` يسمح لجميع الروبوتات ويربط بخريطة الموقع.
- `/llms.txt` ملخص آلي اختياري لمحتوى الموقع، ويُعامل كوسيلة تجريبية لا كعامل ترتيب مضمون.

لا ننشئ في الإصدار الأول مصفوفة صفحات «خدمة × مدينة». نطلق 13 صفحة خدمة و10 صفحات مناطق أصلية. لا نضيف لاحقًا صفحة خدمة ومدينة إلا عندما تتوفر لها مادة محلية فريدة ومشروعات وأدلة حقيقية.

## 5. الخدمات والمناطق والمقالات الأولية

### 5.1 الخدمات الثلاث عشرة

1. مقاولات عامة.
2. ترميم منازل وفلل.
3. تشطيب منازل وفلل.
4. مقاول بناء.
5. أعمال اللياسة.
6. قص الخرسانة بالمنشار والليزر.
7. فتحات كور وتخريم الخرسانة.
8. صبة مروحة، صبة ميول وتنعيم بالمروحية.
9. أعمال الكهرباء.
10. أعمال السباكة.
11. دهانات داخلية وخارجية.
12. تركيب سيراميك وبورسلان.
13. جبس بورد.

### 5.2 مناطق الخدمة العشر

الدمام، الخبر، الظهران، القطيف، الجبيل، سيهات، المنطقة الشرقية، الأحساء، رأس تنورة، وبقيق.

### 5.3 فئات المقالات الخمس

- المقاولات والبناء.
- الترميم والتشطيب.
- الخرسانة والقص والكور.
- الكهرباء والسباكة.
- الديكور والتشطيبات الداخلية.

### 5.4 المقالات الخمسة عند الإطلاق

نكتب لصروح وحدها مقالًا مرجعيًا أصليًا لكل فئة، باللهجة السعودية المهنية، دون إعادة استخدامه في عميل آخر:

1. دليل اختيار مقاول عام في المنطقة الشرقية.
2. دليل ترميم المنازل والفلل: متى تبدأ وكيف تخطط للعمل؟
3. قص الخرسانة وفتحات الكور: الفرق والاستخدامات واحتياطات التنفيذ.
4. تأسيس كهرباء وسباكة المنازل: خطوات تقلل الأعطال بعد التشطيب.
5. تشطيبات المنازل الداخلية: تنسيق الدهانات والسيراميك والجبس بورد.

كل مقال له فئة رئيسية واحدة إلزامية، وقد يرتبط بمدينة واحدة أو أكثر عند وجود علاقة حقيقية. لا نضيف أسماء مدن بغرض الحشو.

## 6. نموذج المحتوى في Sanity

### 6.1 الوثائق

- `siteSettings` singleton: الاسم، الشعار، الأرقام وأولويتها، واتساب، ساعات العمل، إحصاءات الثقة، الدومين، الهوية الاجتماعية المستقبلية، CTA الافتراضي، وصورة المشاركة الافتراضية.
- `homePage` singleton: نص Hero، مقدمة الشركة، الخدمات والمشاريع والمناطق والمقالات المختارة، الأسئلة الشائعة، وترتيب العناصر داخل الأقسام الثابتة. لا يسمح ببناء layout عشوائي.
- `aboutPage` singleton: قصة الشركة، منهج العمل، مؤشرات الثقة وصور داعمة.
- `contactPage` singleton: نص التواصل، تعليمات الاتصال، ومناطق الخدمة المختصرة. لا يوجد form.
- `service`: العنوان، slug، ملخص، مقدمة مباشرة، تفاصيل النطاق، خطوات التنفيذ، فوائد أو معايير الجودة، أسئلة، صور، خدمات ومشروعات ومناطق مرتبطة.
- `serviceArea`: الاسم، slug، مقدمة محلية، وصف التغطية، الخدمات المتاحة، مشروعات مرتبطة، أسئلة محلية، ومدن قريبة.
- `project`: العنوان، slug، ملخص، وصف العمل، الخدمات والمناطق، تاريخ تقريبي اختياري، صور مرتبة، فيديو YouTube اختياري، وترتيب الظهور.
- `post`: العنوان، slug، الملخص، Portable Text، صورة بارزة، فئة رئيسية إلزامية، مناطق اختيارية، `publishedAt` لأول نشر، مقالات مرتبطة وCTA. تاريخ آخر نشر يؤخذ من `_updatedAt` في الوثيقة المنشورة ولا يحتاج حقلًا مخصصًا.
- `category`: اسم الفئة، slug، وصف موجز.
- `redirect`: وثيقة تقنية مخفية من تنقل العميل العادي، للمسارات غير المرتبطة مباشرة بتغيير slug في وثيقة واحدة.

### 6.2 الكائنات المشتركة

- `seo`: `metaTitle`، `metaDescription`، `shareImage`، `noIndex`، و`canonicalOverride` اختياري داخل مجموعة متقدمة. لا توجد حقول primary keyword أو synonyms أو meta keywords.
- `faqItem`: سؤال وإجابة نصية أو Portable Text محدود.
- `cta`: عنوان، نص، نوع الإجراء، والرقم المستخدم، مع قيم افتراضية من الإعدادات.
- `contentImage`: الصورة، alt عربي إلزامي، caption اختياري، hotspot وcrop.
- `youtubeVideo`: رابط YouTube، عنوان، وصف، صورة مصغرة، وتاريخ نشر الفيديو عند توفره. هذه البيانات مطلوبة قبل إدراجه في VideoObject أو Video Sitemap.
- `stat`: قيمة، وحدة أو لاحقة، ووصف؛ مع قيم صروح المثبتة في الإعدادات.

### 6.3 تجربة التحرير والصلاحيات

- تنقل Studio منظم: الإعدادات والصفحات الأساسية، الخدمات، المناطق، المشاريع، المدونة، ثم أدوات تقنية للمطور فقط.
- العميل يستطيع تعديل الأرقام، نصوص CTA، الصور، الخدمات، المناطق، المشاريع، المقالات والفئات وحقول SEO الآمنة.
- العميل لا يرى إدارة redirects التقنية ولا أسرار النشر ولا إعدادات الدومين.
- `canonicalOverride` و`noIndex` في مجموعة «إعدادات SEO متقدمة» مع وصف وتحذير، بينما self-canonical هو الوضع الافتراضي.
- حقول SEO تعرض عدادات وإرشادات تحريرية، لكن الحدود التحذيرية لا تجبر الكاتب على صياغة رديئة لمجرد رقم ثابت.
- validations تمنع slug فارغًا، فئة مفقودة، صورة محتوى بلا alt، أو فيديو بلا metadata اللازمة للفهرسة.

### 6.4 تغيير slug والتحويلات

- كل وثيقة ذات URL تحتوي `redirectFrom[]` تقنيًا، read-only ومخفيًا عن العميل العادي.
- Document action مخصص يقارن slug المنشور السابق بالجديد. عند التغيير، يضيف المسار السابق إلى `redirectFrom[]` دون تكرار أو overwrite.
- وثائق `redirect` مخصصة للتحويلات الأخرى وتدار بواسطة المطور.
- وقت البناء، يجمع generator المسارات القديمة، يطبع المصدر والوجهة بصيغة trailing slash المعتمدة، ويتحقق من عدم وجود حلقات أو تعارضات أو وجهات مفقودة، ثم يولّد `public/_redirects` بتحويلات `301` متوافقة مع Workers Static Assets.
- `_redirects` لا يحتوي قواعد HTTP/HTTPS أو `www`/apex؛ هذه مسؤولية Cloudflare zone settings فقط.

### 6.5 تواريخ النشر والتعديل

- Sanity يحتفظ بالـdraft والوثيقة المنشورة كوثيقتين منفصلتين. تعديل draft وحده لا يغير `_updatedAt` للوثيقة المنشورة.
- `publishedAt` يسجل أول نشر للمقال، بينما `_updatedAt` للوثيقة المنشورة هو `dateModified` ومرشح `lastmod` عند إعادة نشرها.
- صفحات المحتوى ذات الوثيقة الأساسية الواضحة تستخدم `_updatedAt` المنشور. صفحات التجميع أو الصفحات المركبة من عدة references تُحذف منها `lastmod` عندما لا يكون التاريخ ممثلًا موثوقًا لآخر تغيير في HTML.
- لا نستخدم وقت آخر Build، ولا حقل `contentModifiedAt`، ولا Document Action مخصصًا لمقارنة الحقول. generator يحذف `lastmod` بدل تخمينه عند غياب تاريخ موثوق.

## 7. تجربة المستخدم والتصميم

### 7.1 الهوية

- كحلي داكن لون أساسي للثقة والاحتراف.
- برتقالي أو نحاسي accent للأفعال المهمة.
- أبيض للخلفيات ومساحات القراءة.
- رمادي فحمي للنصوص والعناصر الثانوية.
- الشعار المقدم هو المرجع البصري، ويُجهز بنسخ محسنة دون تغيير هويته.
- خط عربي مستضاف محليًا، بأوزان محدودة و`font-display: swap`، بعد التحقق من رخصة الخط.

### 7.2 المكونات الثابتة

- Header واضح يحتوي الروابط الأساسية وقوائم الخدمات والمناطق وزري اتصال وواتساب.
- Footer غني لكن غير محشو: أهم الخدمات، جميع المناطق، المقالات، الاتصال، واتساب، وساعات العمل.
- شريط سفلي ثابت على الهاتف للاتصال والواتساب، مع مساحة آمنة حتى لا يغطي المحتوى.
- Breadcrumbs مرئية في الصفحات الداخلية.
- CTA واضح في منتصف ونهاية الصفحات الطويلة.
- حركات قليلة وتحترم `prefers-reduced-motion`.

### 7.3 الصفحة الرئيسية

Hero مباشر يوضح النشاط والمنطقة، CTA مزدوج، إحصاءات الثقة، خدمات مختارة، مشاريع حقيقية، خطوات العمل، مناطق الخدمة، نبذة الشركة، FAQ، أحدث المقالات وCTA نهائي.

### 7.4 صفحات المحتوى

- الخدمة: جواب مباشر، نطاق الأعمال، خطوات التنفيذ، صور ومشروعات، FAQ، خدمات ومناطق مرتبطة وCTA.
- المنطقة: مقدمة محلية أصلية، الخدمات المتاحة، مشروعات المنطقة، FAQ محلي، روابط مدن قريبة وCTA.
- المشروع: معرض واضح ووصف للعمل وروابط الخدمة والمنطقة وفيديو حقيقي عند توفره.
- المقال: صورة بارزة، Breadcrumbs، تاريخ النشر والتحديث، اسم الشركة ككاتب، جدول محتويات تلقائي للعناوين `H2/H3` عند طول مناسب، أزرار واتساب وX ونسخ الرابط، CTA داخل المحتوى ونهايته، ومقالات مرتبطة.
- اتصل بنا: الرقم الأساسي والاحتياطي، اتصال وواتساب، 24/7، ومناطق الخدمة؛ بلا نموذج أو بريد أو خريطة.
- 404: رسالة عربية مفيدة، بحث غير ضروري، وروابط للرئيسية والخدمات والاتصال.

## 8. SEO وAEO

### 8.1 الأساس الدلالي

- `<html lang="ar-SA" dir="rtl">`، عنصر `main` واحد، `H1` واحد منطقي، وتسلسل عناوين صحيح.
- جميع الروابط المهمة `<a href>` عادية وموجودة في HTML.
- المحتوى يجيب مباشرة ثم يشرح، بعناوين وصفية وأسئلة حقيقية وجداول أو قوائم عند فائدتها.
- لا حشو كلمات، لا صفحات doorway، لا claims أو تقييمات أو تراخيص مخترعة.

### 8.2 metadata وcanonical

- title وdescription فريدان لكل صفحة مع fallback محسوب وآمن.
- Open Graph وTwitter Card وصورة مشاركة 1200×630.
- Self-canonical تلقائي من `site` والمسار النهائي، ولا يستخدم `canonicalOverride` إلا لحالة استثنائية راجعها المطور.
- `noIndex` يستبعد الصفحة من sitemap وRSS والربط الداخلي الآلي، ويخرج meta robots مناسبًا.

### 8.3 البيانات المنظمة

يولد الموقع JSON-LD عبر `@graph` ومعرفات `@id` ثابتة تربط الكيانات:

- `WebSite` و`Organization`/`GeneralContractor` للكيان الأساسي.
- `areaServed` للمناطق، `telephone` للرقمين، و`openingHoursSpecification` للتوفر 24/7.
- لا نضع `address` أو `geo` أو `hasMap` أو `aggregateRating` لعدم وجود بيانات موثقة.
- `WebPage` لكل صفحة، `Service` لصفحات الخدمات، `Article` للمقالات، `BreadcrumbList` للتنقل، و`ImageObject` للصور المهمة.
- `VideoObject` فقط عندما تكون بيانات الفيديو المرئية مطابقة للـmetadata.
- FAQ structured data لا يُضاف إلا للأسئلة الظاهرة حرفيًا في الصفحة، ولا نَعِد بظهور FAQ rich result.
- `Article.datePublished` يستخدم `publishedAt`، و`Article.dateModified` يستخدم `_updatedAt` للوثيقة المنشورة.

### 8.4 Sitemap وRSS وrobots

- كل الملفات تولّد وقت Build من محتوى Sanity المنشور؛ لا توجد endpoints runtime.
- `/sitemap.xml` يولّد كـSitemap Index يشير إلى `/sitemap-pages.xml` و`/sitemap-videos.xml`.
- Sitemap الصفحات يحتوي canonical URLs القابلة للفهرسة فقط. يستخدم `_updatedAt` للوثيقة المنشورة عندما يكون ممثلًا موثوقًا للصفحة، وإلا يحذف `lastmod`.
- لا نضيف `priority` أو `changefreq`.
- RSS يحتوي أحدث المقالات المنشورة وروابطها canonical وتواريخها الفعلية. عنصر `<author>` لكل item يستخدم الصيغة الصحيحة لـRSS 2.0: `info@sorouh.site (شركة صروح الشرقية للمقاولات)`؛ اسم الجهة وحده يظل Author في صفحة المقال وArticle JSON-LD.
- `robots.txt`:
  - `User-agent: *`
  - `Allow: /`
  - رابط sitemap.
- لا نحجب GPTBot أو OAI-SearchBot أو ClaudeBot أو Claude-SearchBot أو أي روبوت آخر.

### 8.5 الفيديو

- فيديو YouTube يظهر في HTML كعنصر `<iframe>` حقيقي أسفل fold مع `loading="lazy"`، `title` واضح، أبعاد ثابتة و`allowfullscreen`.
- لا نستخدم click-to-load أو واجهة تمنع Google من رؤية `src` دون تفاعل.
- Video Sitemap يستخدم YouTube embed URL في `video:player_loc`، مع thumbnail وعنوان ووصف مطابقين للصفحة.
- Shorts تتحول إلى `https://www.youtube.com/embed/{id}` بعد parser موثوق ومختبر.

### 8.6 الاكتشاف والقياس

- نتحقق من ملكية Google Search Console وBing Webmaster Tools ونرسل sitemap بعد الإطلاق.
- Cloudflare Crawler Hints مفعّل لإشارات IndexNow إلى Bing والمحركات المشاركة؛ لا نعتمد عليه لـGoogle.
- Google يعتمد على sitemap وSearch Console والربط الداخلي و`lastmod` الدقيق.
- عناصر الاتصال والواتساب تحمل data attributes ثابتة لتسهيل إضافة analytics مستقبلًا دون تغيير المكونات. لا نضيف منصة تتبع أو cookies غير مطلوبة عند الإطلاق.

## 9. الصور والفيديو والوسائط الحالية

المصدر الحالي يحتوي شعارًا، صور مشاريع، أربعة روابط YouTube، وأربعة ملفات MP4 لأعمال الكهرباء والسباكة. قبل العمل تُنسخ المواد إلى مساحة المشروع، ثم:

- يُرفع الشعار والصور المناسبة إلى Sanity مع alt ووصف وربط بالمشروع والخدمة والمنطقة.
- روابط YouTube هي مصدر تشغيل الفيديو الأساسي.
- ملفات MP4 المحلية لا تُرفع إلى Sanity ولا تُعرض مباشرة في الإنتاج ما دام لها بديل YouTube؛ تحفظ كمواد مصدر فقط.
- صور Sanity تُخرج عبر CDN بأبعاد مضبوطة و`srcset`، وتستخدم `auto=format` ليتفاوض CDN مع `Accept` ويرسل AVIF أو WebP أو صيغة المصدر المناسبة تلقائيًا، مع LQIP عند الحاجة. لا نطلب AVIF مباشرة عبر `fm=avif` ولا نبني `<picture>` لمجرد تبديل الصيغة.
- كل صورة لها `width` و`height` لمنع CLS.
- صورة LCP في Hero لا تكون lazy، وتُحمّل بأولوية مناسبة. بقية الصور `loading="lazy"` و`decoding="async"`.
- لا نضخم الصور أو نستخدم صور stock بدل أدلة المشاريع الحقيقية دون موافقة منفصلة.

## 10. الأداء والوصول والأمان

- أهداف Core Web Vitals عند القياس الميداني: LCP أقل من 2.5 ثانية، INP أقل من 200ms، CLS أقل من 0.1 عند الشريحة 75.
- لا hydration لمكونات ساكنة، ولا carousel ثقيل، ولا autoplay video.
- WCAG 2.2 AA: contrast، focus واضح، Skip Link، لوحة مفاتيح، أسماء وصول للأيقونات، وتسميات عربية واضحة.
- `_headers` يولّد أثناء البناء: security headers المناسبة لموقع ثابت، وسياسة cache طويلة للأصول ذات hashes، وcache أقصر أو revalidation لملفات HTML/XML.
- CSP تسمح فقط بالمصادر المطلوبة، بما فيها Sanity Image CDN وYouTube embed، دون `unsafe-eval`.
- لا أسرار Sanity أو Cloudflare في الكود أو إعدادات Studio العامة. المتغيرات العامة تحتوي project ID وdataset فقط؛ tokens في أسرار CI.
- Dependency updates ومراجعة دورية دون تحديثات تلقائية تكسر الإنتاج.

## 11. Starter العام مقابل مشروع صروح

### 11.1 ما يدخل في Starter العام

- بنية `web` و`studio` و`scripts`.
- Schemas والمكونات وقوالب الاستعلامات وTypeGen.
- design tokens قابلة للتغيير برمجيًا.
- generators للـmetadata وJSON-LD وsitemap وRSS وredirects وheaders.
- اختبارات الجودة وتعليمات إنشاء مشروع عميل جديد.
- Bootstrap ينشئ البنية والـsingletons الفارغة اللازمة فقط، بلا مقالات أو خدمات أو مناطق أو نصوص تسويقية.

### 11.2 ما يخص صروح فقط

- الأسماء والأرقام والإحصاءات والشعار والألوان المضبوطة.
- الخدمات والمناطق والفئات والمشروعات.
- الصفحات التعريفية والمقالات الخمسة وكل نص SEO.
- ملفات الاستيراد والوسائط وروابط الفيديو.

### 11.3 إنشاء عميل جديد

1. إنشاء نسخة مستقلة من Starter في مستودع خاص جديد.
2. إنشاء Sanity Project مستقل وdataset `production` مستقل.
3. ضبط متغيرات المشروع والدومين والهوية.
4. كتابة محتوى العميل الأصلي وإعداد import خاص به.
5. نشر Studio الخاص به عبر `sanity deploy`.
6. نشر موقعه في Worker مستقل وربطه بدومينه.

لا يُربط العملاء داخل Sanity Project واحد، ولا يُنسخ `content/sorouh` إلى العميل الجديد.

## 12. Seed والاستيراد

- Starter العام لا ينشر مقالات أو محتوى SEO.
- `seed:sorouh` خاص بمشروع صروح، ويستورد singletons والخدمات والمناطق والفئات والمشروعات والمقالات الخمسة والوسائط بعد التحقق من project ID الهدف.
- Ordinary documents تحصل على IDs مولدة من Sanity. يستخدم الاستيراد `seedKey` أو `sourceKey` للبحث عن الوثيقة وربط references بالـ`_id` الفعلي؛ لا نبني علاقات من IDs مخترعة.
- التشغيل الافتراضي create-missing: لا يكرر الوثائق ولا يكتب فوق تعديلات المحرر.
- تحديث المحتوى المستورد يحتاج flag صريحًا ومراجعة diff قبل التنفيذ.
- السكربت يرفض التشغيل إذا لم يطابق project ID معرف صروح المسجل في ملف إعداد غير سري. هذا guard يمنع إدخال محتوى صروح في مشروع عميل آخر.

## 13. التعامل مع الأخطاء

- البناء يفشل برسالة واضحة إذا غابت settings أو route data مطلوبة، أو تكرر slug، أو كان redirect مكسورًا، أو احتوت صفحة قابلة للفهرسة على canonical خارج السياسة دون override صريح.
- مستند draft غير منشور لا يظهر في الإنتاج.
- Reference مفقودة لا تُسقط كامل build إذا كانت اختيارية؛ تسجل رسالة محددة ويُخفى المكون. العلاقات الإلزامية تفشل البناء.
- فيديو metadata ناقصة يظهر كتضمين عادي إذا كان صالحًا، لكنه لا يدخل VideoObject أو Video Sitemap حتى تكتمل البيانات.
- صورة مفقودة تستخدم fallback متعمدًا فقط للمشاركة الاجتماعية؛ صور المشاريع والخدمات المطلوبة تمنع النشر بدل صورة وهمية.
- Webhook قد يطلق build متكررًا بأمان؛ Workers Deploy Hooks يمنع النسخ المتطابقة قبل بدء build، ولا يخزن URL السري في المستودع.

## 14. الاختبارات وبوابات النشر

### 14.1 اختبارات آلية

- TypeScript `6.0.3` strict و`astro check`؛ يمنع فحص التبعيات الترقية العرضية إلى TypeScript 7 قبل دعم Astro للـprogrammatic API.
- Sanity schema extraction وTypeGen، ثم فحص أن الأنواع المولدة متزامنة.
- Unit tests لـ:
  - canonical URL builder.
  - phone وWhatsApp URL builders.
  - YouTube ID/embed parser.
  - heading extraction وجدول المحتويات.
  - اختيار `_updatedAt` المنشور كـ`lastmod` أو حذفه للصفحات غير الموثوقة.
  - JSON-LD graph builders.
  - sitemap وRSS و`_redirects` و`_headers` generators.
- Build integration من fixture Sanity data يؤكد توليد كل أنواع الصفحات.
- فحص الروابط الداخلية ووجود صفحة 404 وتحويلات `_redirects` الداخلية دون loops أو خلطها بتحويلات البروتوكول والـhost.
- فحص HTML: title وdescription وcanonical وH1 وlang/dir وalt وأبعاد الصور والـiframe.
- اختبارات متصفح للـHeader، قائمة الهاتف، الشريط الثابت، أزرار الاتصال والواتساب والمشاركة ونسخ الرابط.
- axe accessibility على الصفحات النموذجية.

### 14.2 تدقيق قبل الإنتاج

- Lighthouse على الهاتف والكمبيوتر للصفحة الرئيسية وصفحة خدمة ومنطقة ومقال ومشروع.
- Google Rich Results Test وSchema.org Validator لعينات JSON-LD.
- معاينة sitemap وRSS وrobots وvideo entries.
- تجربة build من Workers Builds، والتأكد أن Preview URL العام يعمل كما هو متوقع.
- اختبار مصفوفة URL على Cloudflare: HTTP إلى HTTPS، و`www` إلى apex، والمسار بلا شرطة إلى الصيغة ذات الشرطة، و`.html` إلى canonical النهائي، مع حفظ path وquery string وعدم وجود loops.
- اختبار Sanity publish → webhook → build → ظهور المحتوى.
- بعد الإطلاق: إضافة Search Console وBing، إرسال sitemap، وتفعيل Crawler Hints.

لا يتم الدمج إلى `main` إذا فشلت بوابة لازمة.

## 15. التسليم

يسلّم المشروع مع:

- مستودع GitHub خاص وتاريخ commits واضح.
- موقع إنتاج على `sorouh.site`.
- Sanity Project وdataset `production` مستقلين لصروح، وStudio مستضاف على `*.sanity.studio`.
- المحتوى والوسائط الأولية المستوردة والمرتبطة.
- README عربي: التشغيل المحلي، إدارة المحتوى، النشر، rollback، تغيير الدومين، وإضافة عميل جديد من Starter.
- دليل محرر قصير للعميل يشرح الأرقام والمشروعات والمقالات والصور وSEO الآمن.
- قائمة إعدادات خارجية موثقة: GitHub، Sanity، Workers Builds، Deploy Hook، custom domain، Always Use HTTPS، Bulk Redirect لـ`www`، Preview URLs العامة، Search Console، Bing، وCrawler Hints.

## 16. قرارات عدم البناء

لمنع الهندسة الزائدة، لا نبني في الإصدار الأول:

- Page Builder أو سحب وإفلات أو ترتيب حر لأقسام الموقع.
- SSR أو API runtime أو قاعدة بيانات في Cloudflare.
- نموذج تواصل، CRM، بريد، حسابات مستخدمين أو لوحة إدارة مخصصة.
- Multi-tenant CMS أو Sanity Project مشترك للعملاء.
- صفحات خدمة × مدينة مولدة آليًا.
- نظام تقييمات أو شهادات أو عنوان وهمي.
- استضافة فيديو إنتاجي على Sanity.
- تكامل IndexNow مخصص.
- حقل `contentModifiedAt` أو Document Action لحساب «أهمية» التعديل.
- إعادة استخدام مقالات صروح أو أي محتوى SEO خاص بها في Starter أو عميل آخر.

## 17. المراجع الرسمية الحاكمة

تُراجع هذه المصادر مرة أخرى أثناء التنفيذ لأن الأدوات السحابية والمكتبات تتغير:

- [Astro Cloudflare integration](https://docs.astro.build/en/guides/integrations-guide/cloudflare/): الموقع الثابت لا يحتاج adapter.
- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/#trailingslash): `trailingSlash` للروابط التي يولدها Astro، مع اعتماد الصفحات prerendered على منصة الاستضافة في enforcement.
- [Cloudflare Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/): نشر `dist` كـStatic Assets.
- [Cloudflare Workers Static Assets best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/): Workers هي الوجهة الموصى بها للمشروعات الجديدة.
- [Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/): فرض canonical URL للـHTML عبر `force-trailing-slash`.
- [Cloudflare Always Use HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/) و[www to apex redirect](https://developers.cloudflare.com/pages/how-to/www-redirect/): توحيد البروتوكول والـhost على مستوى Cloudflare.
- [Cloudflare Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/): المعاينات عامة عند تفعيلها، وهو السلوك المقبول لهذا المشروع.
- [Cloudflare Deploy Hooks](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/): إعادة البناء من headless CMS.
- [Cloudflare Crawler Hints](https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/): إشارات IndexNow على جميع الخطط.
- [Sanity Studio hosting](https://www.sanity.io/docs/studio/deployment): `sanity deploy` والاستضافة على `*.sanity.studio`.
- [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen) و[Querying content in Astro](https://www.sanity.io/docs/astro/query-content-astro): استعلامات `defineQuery` في ملفات TypeScript مستقلة وأنواع مولدة.
- [Sanity Schemas CLI](https://www.sanity.io/docs/cli-reference/cli-schema): أوامر التحقق والاستخراج الحالية هي `sanity schemas validate` و`sanity schemas extract`.
- [Sanity API versioning](https://www.sanity.io/docs/help/js-client-api-version): تثبيت `apiVersion` كسلسلة تاريخ وعدم توليدها ديناميكيًا.
- [Sanity drafts](https://www.sanity.io/docs/content-lake/drafts): استقلال `_updatedAt` للـdraft عن الوثيقة المنشورة.
- [Sanity image transformations](https://www.sanity.io/docs/apis-and-sdks/image-urls): `auto=format` والتفاوض على AVIF/WebP، وعدم دعم `fm=avif` المباشر.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): دقة `lastmod` والتغييرات المهمة.
- [Google video sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps): دعم YouTube embed.
- [Google lazy-loading guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading): عدم اشتراط تفاعل المستخدم لتحميل المحتوى القابل للفهرسة.
- [Schema.org GeneralContractor](https://schema.org/GeneralContractor): نوع الشركة و`areaServed`.
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification): عنصر item `<author>` هو عنوان البريد، ويمكن إلحاق اسم الجهة بين قوسين.
