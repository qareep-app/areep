"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Smartphone, Shield, ArrowLeft, ArrowRight } from "lucide-react"

interface LoginFormProps {
  locale: string
}

export default function LoginForm({ locale }: LoginFormProps) {
  const isRtl = locale === "ar"
  const router = useRouter()

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sendOtp = async () => {
    setError("")
    if (!phone || phone.length < 10) {
      setError(isRtl ? "أدخل رقم موبايل صحيح" : "Enter a valid phone number")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.startsWith("0") ? phone : `0${phone}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setStep("otp")
    } catch (e: any) {
      setError(e.message || (isRtl ? "حصل خطأ، حاول تاني" : "Something went wrong"))
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setError("")
    const code = otp.join("")
    if (code.length !== 6) {
      setError(isRtl ? "أدخل الرمز كاملاً" : "Enter the full code")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Invalid OTP")
      // Save token (simple for now)
      if (data.token) localStorage.setItem("areep_token", data.token)
      if (data.user) localStorage.setItem("areep_user", JSON.stringify(data.user))
      router.push(`/${locale}/dashboard`)
    } catch (e: any) {
      setError(e.message || (isRtl ? "رمز غير صحيح" : "Invalid code"))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const next = [...otp]
    next[index] = value.replace(/\D/g, "")
    setOtp(next)
    if (value && index < 5) {
      document.getElementById(`login-otp-${index + 1}`)?.focus()
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <Smartphone size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? "تسجيل الدخول" : "Login"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl ? "ادخل برقم الموبايل فقط – مفيش باسورد" : "Login with phone number only – no password"}
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {step === "phone" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isRtl ? "رقم الموبايل" : "Phone Number"}
            </label>
            <div className="flex" dir="ltr">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                +20
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="10xxxxxxxx"
                className="flex-1 h-12 px-4 rounded-r-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
          </div>
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition"
          >
            {loading ? (isRtl ? "جاري الإرسال..." : "Sending...") : isRtl ? "إرسال رمز التحقق" : "Send OTP"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            {isRtl ? `تم إرسال رمز إلى ${phone}` : `Code sent to ${phone}`}
          </p>
          <div className="flex justify-center gap-2" dir="ltr">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`login-otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
              />
            ))}
          </div>
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition"
          >
            {loading ? (isRtl ? "جاري التحقق..." : "Verifying...") : isRtl ? "تأكيد الدخول" : "Verify & Login"}
          </button>
          <button
            onClick={() => setStep("phone")}
            className="w-full text-sm text-gray-500 hover:text-emerald-600 flex items-center justify-center gap-1"
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {isRtl ? "تغيير الرقم" : "Change number"}
          </button>
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
        <Shield size={14} className="shrink-0 mt-0.5 text-emerald-600" />
        <span>
          {isRtl
            ? "بنستخدم رقم الموبايل فقط للتحقق. مفيش كلمات مرور ومفيش مشاركة لرقمك مع أي حد."
            : "We only use your phone for verification. No passwords and your number is never shared."}
        </span>
      </div>
    </div>
  )
}
