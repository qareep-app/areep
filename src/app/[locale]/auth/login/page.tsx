"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Loader2 } from "lucide-react"

export default function LoginPage({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState("ar")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [demoOtp, setDemoOtp] = useState("")
  const router = useRouter()

  useState(() => {
    Promise.resolve(params).then((p) => setLocale((p as any).locale || "ar"))
  })

  const isRtl = locale === "ar"

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Demo: generate OTP client-side for presentation
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setDemoOtp(code)
    setStep("otp")
    setLoading(false)
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp === demoOtp || otp === "123456") {
      router.push(`/${locale}/dashboard`)
    } else {
      alert(isRtl ? "رمز غير صحيح — استخدم الرمز الظاهر أو 123456" : "Invalid code")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {isRtl ? "تسجيل الدخول" : "Sign in"}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {isRtl ? "برقم الموبايل المصري" : "With Egyptian mobile number"}
          </p>

          {step === "phone" ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-emerald-500"
              />
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {isRtl ? "إرسال رمز التحقق" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <div className="bg-emerald-50 text-emerald-800 text-sm rounded-xl p-3 text-center">
                {isRtl ? "رمز التحقق (للعرض): " : "Demo OTP: "}
                <strong className="text-lg tracking-widest">{demoOtp}</strong>
                <div className="text-xs mt-1 opacity-70">أو استخدم 123456</div>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-center text-xl tracking-widest"
              />
              <button type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">
                {isRtl ? "تأكيد الدخول" : "Verify"}
              </button>
              <button type="button" onClick={() => setStep("phone")} className="w-full text-sm text-gray-500">
                {isRtl ? "تغيير الرقم" : "Change number"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
