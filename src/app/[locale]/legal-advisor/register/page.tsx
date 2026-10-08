"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Scale, Upload, Loader2 } from "lucide-react"

export default function LegalAdvisorRegisterPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [syndicateNo, setSyndicateNo] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [bio, setBio] = useState("")
  const [certificateUrl, setCertificateUrl] = useState("")
  const [syndicateCardUrl, setSyndicateCardUrl] = useState("")

  const upload = async (file: File, setter: (u: string) => void) => {
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "رفع فشل")
      setter(data.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/legal/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          syndicateNo,
          nationalId,
          bio,
          certificateUrl,
          syndicateCardUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل")
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
        <Header locale={locale} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border p-8 max-w-md text-center space-y-3">
            <Scale className="mx-auto text-emerald-600" size={40} />
            <h1 className="text-xl font-bold">تم إرسال طلب التوثيق</h1>
            <p className="text-sm text-gray-600">
              طلبك قيد مراجعة الأدمن. بعد الموافقة يظهر حسابك كمستشار قانوني معتمد وتقدر ترد من لوحة المستشار.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/legal-advisor`)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm"
            >
              العودة
            </button>
          </div>
        </main>
        <Footer locale={locale} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Header locale={locale} />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10">
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h1 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
            <Scale size={22} />
            توثيق مستشار قانوني
          </h1>
          <p className="text-sm text-gray-500">
            ارفع الشهادات وكارنيه النقابة. الأدمن يراجع قبل تفعيل دور المستشار.
          </p>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</div>
          )}

          <input
            placeholder="الاسم بالكامل"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border"
          />
          <input
            placeholder="01xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className="w-full h-11 px-3 rounded-xl border"
            dir="ltr"
          />
          <input
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border"
            dir="ltr"
          />
          <input
            placeholder="رقم القيد بالنقابة"
            value={syndicateNo}
            onChange={(e) => setSyndicateNo(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border"
          />
          <input
            placeholder="الرقم القومي"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border"
            dir="ltr"
          />
          <textarea
            placeholder="نبذة مختصرة"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border"
            rows={2}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Upload size={14} /> شهادة / مؤهل
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) upload(f, setCertificateUrl)
              }}
            />
            {certificateUrl && <p className="text-xs text-emerald-600">تم الرفع ✓</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Upload size={14} /> كارنيه النقابة
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) upload(f, setSyndicateCardUrl)
              }}
            />
            {syndicateCardUrl && <p className="text-xs text-emerald-600">تم الرفع ✓</p>}
          </div>

          <button
            type="button"
            disabled={loading || uploading}
            onClick={submit}
            className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            إرسال للأدمن للمراجعة
          </button>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
