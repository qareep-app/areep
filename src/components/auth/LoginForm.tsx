"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, ArrowLeft, ArrowRight, Phone } from "lucide-react"

interface Props {
  locale: string
}

export default function LoginForm({ locale }: Props) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [devOtp, setDevOtp] = useState<string | null>(null)

  const sendOtp = async () => {
    setError("")
    setInfo("")
    setDevOtp(null)
    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      setError(isRtl ? "رقم موبايل مصري غير صحيح" : "Invalid Egyptian mobile")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setInfo(data.message || "")
      if (data.devOtp) setDevOtp(data.devOtp)
      setStep("otp")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1)
    const next = [...otpDigits]
    next[i] = d
    setOtpDigits(next)
    if (d && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`)
      el?.focus()
    }
  }

  const verifyOtp = async () => {
    const otp = otpDigits.join("")
    if (otp.length !== 6) {
      setError(isRtl ? "أدخل الرمز المكون من 6 أرقام" : "Enter 6-digit code")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || "Failed")
      try {
        localStorage.setItem("areep_user", JSON.stringify(data.user))
      } catch {}
      // Hard navigation so browser applies Set-Cookie before next page
      const dest =
        data.user?.role === "ADMIN"
          ? `/${locale}/admin`
          : `/${locale}/dashboard`
      window.location.href = dest
      return
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Phone className="text-emerald-600" />
        <h1 className="text-xl font-bold">
          {isRtl ? "دخول برقم الموبايل" : "Login with mobile"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</div>
      )}
      {info && (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">{info}</div>
      )}
      {devOtp && (
        <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2">
          {isRtl ? "رمز تجريبي (مزود SMS غير مضبوط): " : "Dev OTP (no SMS provider): "}
          <strong className="tracking-widest text-lg">{devOtp}</strong>
        </div>
      )}

      {step === "phone" ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">{isRtl ? "رقم الموبايل" : "Mobile"}</label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="01xxxxxxxxx"
              className="mt-1 w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left"
              dir="ltr"
            />
          </div>
          <button
            type="button"
            onClick={sendOtp}
            disabled={loading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl"
          >
            {loading
              ? isRtl
                ? "جاري الإرسال..."
                : "Sending..."
              : isRtl
                ? "إرسال رمز التحقق"
                : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {isRtl ? `أدخل الرمز المرسل إلى ${phone}` : `Enter code sent to ${phone}`}
          </p>
          <div className="flex justify-center gap-2" dir="ltr">
            {otpDigits.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                value={d}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                inputMode="numeric"
                maxLength={1}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={verifyOtp}
            disabled={loading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl"
          >
            {loading
              ? isRtl
                ? "جاري التحقق..."
                : "Verifying..."
              : isRtl
                ? "تأكيد الدخول"
                : "Verify & Login"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-sm text-gray-500 hover:text-emerald-600 flex items-center justify-center gap-1"
          >
            {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {isRtl ? "تغيير الرقم" : "Change number"}
          </button>
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
        <Shield size={14} className="shrink-0 mt-0.5 text-emerald-600" />
        <span>
          {isRtl
            ? "رقم الموبايل للتحقق فقط. مفيش كلمة مرور، ومفيش مشاركة الرقم مع معلنين آخرين."
            : "Phone is only for verification. No password; number is never shared with other users."}
        </span>
      </div>
    </div>
  )
}
