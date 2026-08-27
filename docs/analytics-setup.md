# إعداد GA4 وGTM لصروح

يُفعّل القياس من Google Tag Manager فقط بعد إنشاء الحسابات ونشر Container صالح. الموقع لا يرسل رقم الهاتف أو رابط واتساب أو نص الرسالة ضمن بيانات الحدث.

## الأسماء المعتمدة

- GA4 property: `Sorouh Site`
- Web stream: `Sorouh Production` — `https://sorouh.site`
- GTM container: `Sorouh Website` — Web
- GA4 Configuration tag: `GA4 - Sorouh Production`
- Custom event tag: `GA4 Event - contact_click`
- Trigger: `Custom Event - contact_click`
- Event name: `contact_click`
- Event parameters: `contact_type`, `contact_location`, `page_path`

في GA4 تُنشأ حدثان مشتقان ويُعلنان Key events:

- `call_click` عندما `contact_type` يساوي `call`.
- `whatsapp_click` عندما `contact_type` يساوي `whatsapp`.

## إعداد GTM

1. أنشئ Property وWeb stream بالأسماء أعلاه، ثم انسخ Measurement ID إلى Tag الإعداد في GTM.
2. أنشئ Trigger من نوع Custom Event، Event name يساوي `contact_click`.
3. أنشئ Tag من نوع Google Analytics: GA4 Event باسم `contact_click`، وأضف Event Parameters الثلاثة من Data Layer Variables بالأسماء نفسها.
4. لا تنشئ Variable أو Parameter من `href` أو رقم هاتف أو محتوى رسالة واتساب.
5. في Preview اختبر مواضع الاتصال: header، service hero، service end، area hero، area end، footer، mobile bar.
6. لا تنشر Container قبل أن يظهر event واحد على الأقل بكل من `contact_type` و`contact_location` و`page_path` في Preview.

## النشر والتحقق

1. أضف Container ID العام فقط بصيغة `GTM-...` في Cloudflare Workers Builds production variable باسم `PUBLIC_GTM_ID`.
2. لا تضف القيمة إلى Git أو إلى `web/.env` المحلي.
3. شغّل rebuild للإنتاج ثم افحص HTML: يظهر GTM loader وnoscript فقط عند وجود المتغير.
4. نفّذ نقرة اتصال ونقرة واتساب في GTM Preview، ثم تحقق من GA4 DebugView وRealtime.
5. راجع Enhanced Measurement واحتياجات الخصوصية/الكوكيز قبل إضافة أي Tag إضافي.

عندما يكون `PUBLIC_GTM_ID` فارغًا لا يظهر GTM markup. يبقى مستمع `contact-events.js` خفيفًا في الصفحة، ولا ينشئ أو يرسل أي بيانات ما لم يوفّر GTM `dataLayer`.
