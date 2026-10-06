# رفع قريب على Vercel

## 1. حسابات مطلوبة
- حساب GitHub: https://github.com
- حساب Vercel: https://vercel.com (سجّل بـ GitHub)

## 2. رفع الكود على GitHub
1. أنشئ مستودع جديد اسمه `qareep`
2. من مجلد المشروع على جهازك:

```bash
git init
git add .
git commit -m "Areep MVP ready for demo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/qareep.git
git push -u origin main
```

(لا ترفع ملف `.env` — هو في `.gitignore`)

## 3. ربط Vercel
1. ادخل vercel.com → Add New Project
2. Import من GitHub مستودع `qareep`
3. Framework: Next.js (تلقائي)
4. Environment Variables — أضف:

```
DATABASE_URL = (رابط Neon Pooler كامل)
NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
NEXT_PUBLIC_DEFAULT_LOCALE = ar
```

5. Deploy

## 4. بعد الرفع
- افتح الرابط اللي Vercel هيديهولك
- جرب /ar و /api/health
- لو DATABASE خطأ: Settings → Environment Variables → عدّل وأعد Deploy

## ملاحظات
- Neon لازم يفضل Active
- الصور Base64 تشتغل على Vercel بدون إعداد إضافي
