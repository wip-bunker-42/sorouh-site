# قائمة إطلاق عميل جديد

1. أنشئ مستودعًا خاصًا جديدًا من الكود، واستبدل حزمة `content/sorouh` وseed/audit الخاصين بها بحزمة العميل الجديد؛ لا تنسخ محتواها أو مقالاتها كبيانات للعميل.
2. أنشئ Sanity Project مستقلًا للعميل وdataset `production` مستقلًا.
3. حدّث `PUBLIC_SITE_ORIGIN` ومتغيرات مشروع Sanity وهوية المحتوى وWorker وStudio host.
4. شغّل `bootstrap:client` لإنشاء هياكل singletons الفارغة فقط.
5. اكتب خدمات ومناطق ومشاريع ومقالات أصلية للعميل؛ لا تدوّر مقالات SEO.
6. أدخل أصول العميل، راجع hashes/alt/crops، ثم ابنِ seed خاصًا مع حارس Project ID.
7. راجع الهاتف وواتساب وSEO وJSON-LD وsitemaps وRSS و404 على build حي.
8. شغّل الاختبارات والمراجعة البصرية desktop/mobile ثم انشر Studio وWorker.
9. اربط apex وwww/HTTPS وCrawler Hints وSearch Console/Bing.

القالب برمجي وليس page builder أو drag-and-drop. المكونات والنموذج يعاد استخدامهما، أما هوية العميل ومحتواه ومشروع Sanity ومستودعه ونشره فتظل معزولة.
