"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Megaphone, Scale, Shield } from "lucide-react"

interface Props {
  locale: string
}

export default function AdminOverview({ locale }: Props) {
  const isRtl = locale === "ar"
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || "Unauthorized")
        setData(j)
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm space-y-3">
        <p className="font-semibold text-amber-900">
          {isRtl ? "مطلوب دخول أدمن" : "Admin login required"}
        </p>
        <p className="text-amber-800">
          {isRtl
            ? "ادخل برقم موبايل أدمن (مضبوط في ADMIN_PHONES) من صفحة الدخول."
            : "Sign in with an admin phone (ADMIN_PHONES env)."}
        </p>
        <p className="text-xs text-amber-700">{error}</p>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium"
        >
          {isRtl ? "تسجيل الدخول" : "Login"}
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center text-gray-400 text-sm">
        {isRtl ? "جاري تحميل لوحة التحكم..." : "Loading admin..."}
      </div>
    )
  }

  const s = data.stats || {}
  const cards = [
    { label: isRtl ? "المستخدمون" : "Users", value: s.users, icon: Users },
    { label: isRtl ? "كل الإعلانات" : "All ads", value: s.ads, icon: Megaphone },
    { label: isRtl ? "إعلانات نشطة" : "Active ads", value: s.activeAds, icon: Megaphone },
    { label: isRtl ? "استشارات قانونية" : "Legal", value: s.consultations, icon: Scale },
    { label: isRtl ? "صفقات وسيط" : "Escrow", value: s.escrow, icon: Shield },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isRtl ? "لوحة تحكم الأدمن" : "Admin dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl ? "نظرة عامة على المنصة" : "Platform overview"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
          >
            <c.icon className="text-emerald-600 mb-2" size={20} />
            <div className="text-2xl font-bold">{c.value ?? 0}</div>
            <div className="text-xs text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-4">
          <h2 className="font-semibold mb-3">{isRtl ? "أحدث الإعلانات" : "Recent ads"}</h2>
          <ul className="space-y-2 text-sm">
            {(data.recentAds || []).map((a: any) => (
              <li key={a.id} className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                <Link href={`/${locale}/ads/${a.id}`} className="text-emerald-700 hover:underline truncate">
                  {a.titleAr}
                </Link>
                <span className="text-gray-400 shrink-0 text-xs">
                  {Number(a.price).toLocaleString()} · {a.status}
                </span>
              </li>
            ))}
            {!data.recentAds?.length && (
              <li className="text-gray-400">{isRtl ? "لا يوجد" : "None"}</li>
            )}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-4">
          <h2 className="font-semibold mb-3">{isRtl ? "أحدث المستخدمين" : "Recent users"}</h2>
          <ul className="space-y-2 text-sm">
            {(data.recentUsers || []).map((u: any) => (
              <li key={u.id} className="flex justify-between gap-2 border-b border-gray-50 pb-2">
                <span dir="ltr">{u.phone}</span>
                <span className="text-xs text-gray-400">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/legal-advisor/inbox`}
          className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
        >
          {isRtl ? "استشارات قانونية" : "Legal inbox"}
        </Link>
        <Link
          href={`/${locale}/escrow`}
          className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
        >
          {isRtl ? "سياسة الوسيط" : "Escrow policy"}
        </Link>
        <Link
          href={`/${locale}/ads`}
          className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
        >
          {isRtl ? "كل الإعلانات" : "All ads"}
        </Link>
      </div>
    </div>
  )
}
