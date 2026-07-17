# دليل إعداد تسجيل الدخول الاجتماعي (Social Auth Setup Guide)

لتفعيل أزرار تسجيل الدخول بواسطة (Google, Facebook, LinkedIn)، يجب عليك إنشاء تطبيقات في منصات المطورين الخاصة بكل موقع والحصول على المفاتيح (Client ID & Client Secret) ثم إضافتها في ملف الـ `.env` الخاص بك.

إليك البيانات التي ستحتاجها أثناء الإعداد في منصات المطورين:

---

## 1. إعداد جوجل (Google OAuth 2.0)
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/).
2. أنشئ مشروعاً جديداً.
3. توجه إلى **APIs & Services** ثم **OAuth consent screen**، واكتمل الإعدادات كـ **External**.
4. اذهب إلى **Credentials**، ثم انقر على **Create Credentials** واختر **OAuth client ID**.
5. اختر نوع التطبيق: **Web application**.
6. في حقل **Authorized JavaScript origins**، أضف:
   - `http://localhost:3000` (للتطوير المحلي)
   - رابط موقعك الفعلي (في الإنتاج)
7. في حقل **Authorized redirect URIs**، أضف:
   - `http://localhost:3000/api/auth/social/google/callback`
   - `https://your-domain.com/api/auth/social/google/callback` (في الإنتاج)
8. انسخ الـ **Client ID** والـ **Client Secret** وضعهما في ملف `.env`:
   ```env
   GOOGLE_CLIENT_ID="رقم_العميل_هنا"
   GOOGLE_CLIENT_SECRET="سر_العميل_هنا"
   ```

---

## 2. إعداد فيسبوك (Facebook Login)
1. توجه إلى [Facebook Developers Console](https://developers.facebook.com/).
2. أنشئ تطبيقاً جديداً واختر نوعه (مثلاً **Consumer** أو إعداد مخصص يسمح بـ Facebook Login).
3. أضف منتج **Facebook Login** لتطبيقك.
4. اذهب إلى إعدادات المنتج (Facebook Login -> Settings) وقم بتهيئة الحقول التالية:
   - فعل خيار **Client OAuth Login** و **Web OAuth Login**.
   - في حقل **Valid OAuth Redirect URIs**، أضف:
     - `http://localhost:3000/api/auth/social/facebook/callback`
     - `https://your-domain.com/api/auth/social/facebook/callback` (في الإنتاج)
5. اذهب إلى الإعدادات العامة (Settings -> Basic) للحصول على مفاتيحك.
6. انسخ الـ **App ID** والـ **App Secret** وضعهما في ملف `.env`:
   ```env
   FACEBOOK_CLIENT_ID="معرف_التطبيق_هنا"
   FACEBOOK_CLIENT_SECRET="سر_التطبيق_هنا"
   ```

---

## 3. إعداد لينكد إن (LinkedIn Sign In)
1. توجه إلى [LinkedIn Developer Portal](https://developer.linkedin.com/).
2. أنشئ تطبيقاً جديداً واربطه بصفحة شركة (LinkedIn Page) إن لزم الأمر.
3. اذهب إلى تبويب **Products** وفعل منتج **Sign In with LinkedIn using OpenID Connect** (أو Sign In with LinkedIn القديم).
4. اذهب إلى تبويب **Auth** لرؤية مفاتيحك وتهيئة الروابط.
5. في حقل **Authorized Redirect URLs**، أضف:
   - `http://localhost:3000/api/auth/social/linkedin/callback`
   - `https://your-domain.com/api/auth/social/linkedin/callback` (في الإنتاج)
6. انسخ الـ **Client ID** والـ **Client Secret** وضعهما في ملف `.env`:
   ```env
   LINKEDIN_CLIENT_ID="معرف_العميل_هنا"
   LINKEDIN_CLIENT_SECRET="سر_العميل_هنا"
   ```

---

> [!IMPORTANT]
> بعد تعديل قيم ملف الـ `.env` وإضافة المفاتيح الحقيقية الخاصة بك، ستحتاج إلى إعادة تشغيل السيرفر المحلي عبر إيقافه وتشغيله مجدداً (`npm run dev`) ليقوم بتطبيق الإعدادات الجديدة!
