"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Scale, MessageCircle, FileCheck, Percent, Loader2, Lock } from "lucide-react"

export default function LegalDashboardPanel({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [consultations, setConsultations] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch("/api/me/legal-consultations", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setConsultations(d.items || []))
      .catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 flex justify-center gap-2">
        <Loader2 className="animate-spin" size={18} />
        {isRtl ? "جاري التحميل..." : "Loading..."}
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center space-y-4">
        <Lock className="mx-auto text-gray-400" size={36} />
        <h1 className="text-xl font-bold">
          {isRtl ? "المستشار القانوني" : "Legal Advisor"}
        </h1>
        <p className="text-sm text-gray-600">
          {isRtl
            ? "الخدمة ظاهرة للزوار للتعرّف عليها. لاستخدامها سجّل حساباً برقم الموبايل."
            : "Visible to visitors for discovery. Sign in with your mobile to use it."}
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
        >
          {isRtl ? "سجّل دخول / أنشئ حساب" : "Sign in / Create account"}
        </Link>
      </div>
    )
  }

  const isLegal =
    user.role === "LEGAL" ||
    user.role === "LEGAL_ADVISOR" ||
    user.isLegalAdvisor === true

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Scale className="text-emerald-600" size={26} />
          {isRtl ? "المستشار القانوني" : "Legal Advisor"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "استشارة قانونية داخل الموقع فقط — بدون أرقام أو عناوين في الشات. عمولة الموقع 5% مقسّمة على الطرفين."
            : "In-app legal consultation only — no phone numbers or addresses in chat. Platform fee 5% split between both parties."}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-4">
          <Percent className="text-emerald-600 mb-2" size={20} />
          <div className="font-semibold text-sm">
            {isRtl ? "عمولة الموقع 5%" : "Platform fee 5%"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl
              ? "2.5% من المستشير + 2.5% من المستشار عند إتمام الاستشارة المدفوعة"
              : "2.5% from client + 2.5% from advisor on paid consultation"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <MessageCircle className="text-emerald-600 mb-2" size={20} />
          <div className="font-semibold text-sm">
            {isRtl ? "تواصل داخل قريب فقط" : "In-app chat only"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl
              ? "ممنوع تبادل أرقام أو عناوين — لحماية الطرفين والعمولة"
              : "No sharing phones or addresses — protects both parties and the fee"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <FileCheck className="text-emerald-600 mb-2" size={20} />
          <div className="font-semibold text-sm">
            {isRtl ? "مستشار موثّق" : "Verified advisor"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isRtl
              ? "يشترط رفع شهادات وكارنيه النقابة وموافقة الأدمن"
              : "Requires certificates, bar card upload, and admin approval"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-semibold">
          {isRtl ? "لأي حساب مسجّل" : "For any registered account"}
        </h2>
        <p className="text-sm text-gray-600">
          {isRtl
            ? "تقدر تطلب استشارة قانونية أو تربط مستشاراً بصفقة (وسيط / عقار) من غير ما تكون بائع."
            : "You can request legal advice or attach an advisor to a deal (escrow / real estate) without being a seller."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/legal-advisor`}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
          >
            {isRtl ? "ابدأ استشارة" : "Start consultation"}
          </Link>
          <Link
            href={`/${locale}/legal-advisor#policy`}
            className="px-4 py-2.5 rounded-xl border text-sm"
          >
            {isRtl ? "سياسة المستشار" : "Advisor policy"}
          </Link>
        </div>
      </div>

      {!isLegal && (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 space-y-2">
          <h2 className="font-semibold text-violet-900">
            {isRtl ? "هل أنت محامٍ؟" : "Are you a lawyer?"}
          </h2>
          <p className="text-sm text-violet-800">
            {isRtl
              ? "التسجيل كمستشار منفصل عن «سجّل كبائع». ارفع المستندات وانتظر موافقة الأدمن."
              : "Legal advisor registration is separate from seller signup. Upload documents and wait for admin approval."}
          </p>
          <Link
            href={`/${locale}/legal-advisor/register`}
            className="inline-flex px-4 py-2.5 rounded-xl bg-violet-700 text-white text-sm font-semibold"
          >
            {isRtl ? "سجّل كمستشار قانوني" : "Register as legal advisor"}
          </Link>
        </div>
      )}

      {isLegal && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-2">
          <h2 className="font-semibold text-emerald-900">
            {isRtl ? "حسابك مستشار موثّق" : "Your account is a verified advisor"}
          </h2>
          <Link
            href={`/${locale}/legal-advisor/inbox`}
            className="inline-flex px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold"
          >
            {isRtl ? "فتح صندوق الاستشارات" : "Open consultations inbox"}
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-5 py-3 border-b font-semibold text-sm">
          {isRtl ? "استشاراتي" : "My consultations"}
        </div>
        {consultations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {isRtl
              ? "مفيش استشارات لسه."
              : "No consultations yet."}
          </div>
        ) : (
          <ul className="divide-y">
            {consultations.map((c) => (
              <li key={c.id} className="px-5 py-3 text-sm flex justify-between gap-2">
                <span>{c.subject || c.title || c.id}</span>
                <span className="text-gray-500">{c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
