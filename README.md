# قريب | Areep

منصة إعلانات مبوبة مصرية – **دكانك قريب**

الدومين الحالي (قابل للتغيير): `areep.eg`

---

## التشغيل المحلي (خطوة بخطوة)

### 1. المتطلبات
- Node.js 18+ 
- حساب مجاني على [Neon.tech](https://neon.tech) (PostgreSQL)

### 2. قاعدة البيانات
1. أنشئ مشروع على Neon
2. انسخ Connection String
3. ضعه في ملف `.env`:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. تثبيت وتشغيل

```bash
cd qareep
npm install --legacy-peer-deps

npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

npm run dev
```

افتح: **http://localhost:3000/ar**

> في وضع التطوير: رمز الـ OTP بيظهر في التيرمينال (console).

---

## الميزات الجاهزة

| الميزة | الحالة |
|--------|--------|
| الصفحة الرئيسية + التصميم | ✅ |
| عربي + إنجليزي | ✅ |
| إضافة إعلان | ✅ |
| شات داخلي (بدون أرقام) | ✅ |
| لوحة تحكم المستخدم | ✅ |
| نظام الوسيط + العمولات | ✅ |
| العقود العقارية (توقيع + OTP) | ✅ |
| لوحة الأدمن + حماية | ✅ |
| Auth برقم الموبايل (OTP) | ✅ |
| رفع الصور | ✅ |
| Prisma + Seed | ✅ |
| جاهز لـ Vercel | ✅ |

---

## الرفع على Vercel + قاعدة بيانات سحابية

1. ارفع الكود على GitHub
2. ادخل [vercel.com](https://vercel.com) → New Project → استورد الريبو
3. في Environment Variables أضف:
   - `DATABASE_URL` (من Neon)
   - `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`
   - مفاتيح Paymob لما تبقى جاهزة
4. Deploy

Neon و Vercel بيشتغلوا مع بعض ممتاز.

---

## ملاحظات مهمة

- **الدومين** يتغير من `NEXT_PUBLIC_APP_URL` فقط
- **الأدمن** في الإنتاج محمي (لازم `areep_role=ADMIN`)
- **الصور** حالياً بتتحفظ في `public/uploads` – غيّرها لـ R2/S3 في الإنتاج
- **SMS** حالياً بيطبع الـ OTP في الـ console (طور التطوير)

---

## أوامر مفيدة

```bash
npm run dev          # تشغيل محلي
npx prisma studio    # واجهة قاعدة البيانات
npx prisma db push   # تحديث الجداول
```
