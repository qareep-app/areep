"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const BUSINESS = [
  { value: "فرد", label: "فرد" },
  { value: "محل_قطاعي", label: "محل / بائع قطاعي" },
  { value: "جملة", label: "بائع جملة" },
  { value: "شركة", label: "شركة / مورد" },
]

export default function SellerRegisterPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const router = useRouter()
  const isRtl = locale === "ar"

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const [email, setEmail] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [shopName, setShopName] = useState("")
  const [shopBio, setShopBio] = useState("")
  const [businessType, setBusinessType] = useState("فرد")
  const [verifyLevel, setVerifyLevel] = useState<"BASIC" | "VERIFIED">("BASIC")
  const [nationalId, setNationalId] = useState("")
  const [commercialReg, setCommercialReg] = useState("")
  const [isVat, setIsVat] = useState(false)
  const [addressDetail, setAddressDetail] = useState("")
  const [addressExtra, setAddressExtra] = useState("")
  const [addressCity, setAddressCity] = useState("")

  const total = 7

  const sendEmailOtp = async () => {
    setError("")
    if (!email.includes("@")) {
      setError(isRtl ? "بريد غير صحيح" : "Invalid email")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || "failed")
      setEmailSent(true)
      if (data.devOtp) setEmailOtp(data.devOtp)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/seller/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          fullName,
          shopName,
          shopBio,
          businessType,
          verifyLevel,
          nationalId: verifyLevel === "BASIC" ? nationalId : null,
          commercialReg: verifyLevel === "VERIFIED" ? commercialReg : null,
          isVatRegistered: isVat,
          addressDetail,
          addressExtra,
          addressCity,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || "failed")
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const next = () => {
    setError("")
    if (step === 1 && !email) return setError(isRtl ? "أدخل البريد" : "Email required")
    if (step === 3 && (!fullName || !phone || !shopName))
      return setError(isRtl ? "أكمل بيانات الحساب" : "Complete account fields")
    if (step < total) setStep(step + 1)
    else submit()
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf8f5]" dir="rtl">
        <Header locale={locale} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border p-8 max-w-md text-center space-y-3">
            <h1 className="text-xl font-bold text-emerald-800">تم إرسال الطلب</h1>
            <p className="text-sm text-gray-600">
              هيتعمل حسابك وهيتبعت طلب بائع لمراجعة فريق قريب. بعد الموافقة تقدر تعرض سلعك.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-medium"
            >
              العودة للرئيسية
            </button>
          </div>
        </main>
        <Footer locale={locale} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]" dir="rtl">
      <Header locale={locale} />
      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg p-6 sm:p-8">
          <h1 className="text-xl font-bold text-emerald-800 text-center mb-1">
            سجّل كبائع في قريب
          </h1>
          <p className="text-center text-xs text-gray-400 mb-4">
            خطوة {step} من {total}
          </p>
          <div className="flex gap-1 mb-6">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < step ? "bg-emerald-700" : "bg-stone-200"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border"
                placeholder="name@email.com"
                dir="ltr"
              />
              <p className="text-xs text-gray-400">هيبعتلك رمز تحقق مكوّن من 6 أرقام</p>
              <button
                type="button"
                onClick={sendEmailOtp}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-700 text-white font-medium"
              >
                إرسال الرمز
              </button>
              {emailSent && (
                <input
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="رمز التحقق"
                  className="w-full h-11 px-3 rounded-xl border"
                  dir="ltr"
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm text-gray-600">
              <p>تم التحقق من البريد. أكمل بيانات الحساب في الخطوة التالية.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="text-sm">الاسم بالكامل</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border mt-1"
                />
              </div>
              <div>
                <label className="text-sm">رقم الموبايل</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="w-full h-11 px-3 rounded-xl border mt-1"
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                />
              </div>
              <div>
                <label className="text-sm">اسم المحل / النشاط</label>
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border mt-1"
                />
              </div>
              <div>
                <label className="text-sm">وصف مختصر (اختياري)</label>
                <textarea
                  value={shopBio}
                  onChange={(e) => setShopBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border mt-1"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm">نوع النشاط</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border mt-1"
                >
                  {BUSINESS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">مستوى التوثيق (يؤثر على سقف الطلب فقط — العمولة ثابتة)</p>
              <label className="flex gap-3 p-4 rounded-xl border cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
                <input
                  type="radio"
                  name="vl"
                  checked={verifyLevel === "BASIC"}
                  onChange={() => setVerifyLevel("BASIC")}
                />
                <div>
                  <div className="font-semibold">تحقق أساسي (رقم قومي)</div>
                  <div className="text-xs text-gray-500">عمولة حسب الفئة — حد أقصى 25,000 ج.م للطلب</div>
                </div>
              </label>
              <label className="flex gap-3 p-4 rounded-xl border cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
                <input
                  type="radio"
                  name="vl"
                  checked={verifyLevel === "VERIFIED"}
                  onChange={() => setVerifyLevel("VERIFIED")}
                />
                <div>
                  <div className="font-semibold">تحقق موثّق (سجل تجاري) ✓</div>
                  <div className="text-xs text-gray-500">بدون حد أقصى + شارة «موثّق»</div>
                </div>
              </label>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              {verifyLevel === "BASIC" ? (
                <>
                  <label className="text-sm">الرقم القومي</label>
                  <input
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-400">
                    رفع صور البطاقة (أمامي/خلفي) يتاح لاحقاً من لوحة البائع — يمكن المتابعة الآن.
                  </p>
                </>
              ) : (
                <>
                  <label className="text-sm">رقم السجل التجاري</label>
                  <input
                    value={commercialReg}
                    onChange={(e) => setCommercialReg(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border"
                    dir="ltr"
                  />
                </>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isVat} onChange={(e) => setIsVat(e.target.checked)} />
                مسجل في ضريبة القيمة المضافة
              </label>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <div>
                <label className="text-sm">العنوان بالتفصيل</label>
                <input
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border mt-1"
                />
              </div>
              <div>
                <label className="text-sm">تفاصيل إضافية (اختياري)</label>
                <input
                  value={addressExtra}
                  onChange={(e) => setAddressExtra(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border mt-1"
                />
              </div>
              <div>
                <label className="text-sm">المدينة / المحافظة</label>
                <input
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border mt-1"
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="bg-stone-50 rounded-xl p-4 text-sm space-y-1">
              <div>الاسم: {fullName}</div>
              <div>البريد: {email}</div>
              <div dir="ltr">الموبايل: {phone}</div>
              <div>المحل: {shopName}</div>
              <div>النشاط: {businessType}</div>
              <div>مستوى التوثيق: {verifyLevel === "BASIC" ? "أساسي" : "موثّق"}</div>
              <div>
                العنوان: {addressDetail}
                {addressCity ? `، ${addressCity}` : ""}
              </div>
              <p className="text-xs text-gray-500 pt-2">
                بالضغط على «إرسال الطلب» هيتعمل حسابك وهيتبعت طلب بائع لمراجعة فريق قريب.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-11 rounded-xl border border-emerald-800 text-emerald-800 font-medium"
              >
                السابق
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-emerald-700 text-white font-medium disabled:opacity-60"
            >
              {step === total ? (loading ? "جاري الإرسال..." : "إرسال الطلب") : "التالي"}
            </button>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
