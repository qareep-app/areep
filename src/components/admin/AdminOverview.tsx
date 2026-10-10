"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users, Store, Package, FolderOpen, HandCoins, Lock, ShoppingBag,
  Scale, Shield, FileCheck,
} from "lucide-react"

interface Props {
  locale: string
}

export default function AdminOverview({ locale }: Props) {
  const isRtl = locale === "ar"
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = () => {
    fetch("/api/admin/stats")
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || "Unauthorized")
        setData(j)
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    load()
  }, [])

  const decide = async (id: string, action: "APPROVE" | "REJECT") => {
    setBusy(id)
    await fetch("/api/seller/apply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    })
    setBusy(null)
    load()
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm space-y-3">
        <p className="font-semibold text-amber-900">
          {isRtl ? "مطلوب دخول أدمن" : "Admin login required"}
        </p>
        <p className="text-xs text-amber-700">{error}</p>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-medium"
        >
          {isRtl ? "تسجيل الدخول" : "Login"}
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center text-gray-400 text-sm">
        {isRtl ? "جاري التحميل..." : "Loading..."}
      </div>
    )
  }

  const s = data.stats || {}
  const topStats = [
    { label: isRtl ? "متصلون الآن" : "Online now", value: s.onlineUsers ?? 0 },
    { label: isRtl ? "إجمالي المستخدمين" : "Users", value: s.users },
    { label: isRtl ? "إجمالي البائعين" : "Sellers", value: s.sellers },
    { label: isRtl ? "بائعين قيد المراجعة" : "Pending sellers", value: s.sellersPending },
    { label: isRtl ? "حسابات مجمدة" : "Banned", value: s.banned },
    { label: isRtl ? "إعلانات نشطة" : "Active ads", value: s.activeAds },
    { label: isRtl ? "إجمالي الإعلانات" : "All ads", value: s.ads },
    { label: isRtl ? "استشارات قانونية" : "Legal", value: s.consultations },
    { label: isRtl ? "صفقات وسيط" : "Escrow", value: s.escrow },
  ]

  const sections = [
    {
      href: `/${locale}/admin/users`,
      title: isRtl ? "إدارة المستخدمين" : "Users",
      desc: isRtl ? "تجميد / إلغاء تجميد / إيقاف بائع / حذف" : "Freeze / unban / suspend seller / delete",
      icon: Users,
    },
    {
      href: `/${locale}/admin/sellers`,
      title: isRtl ? "إدارة البائعين" : "Sellers",
      desc: isRtl ? "الموافقة أو الرفض على البائعين الجدد" : "Approve or reject sellers",
      icon: Store,
    },
    {
      href: `/${locale}/admin/categories`,
      title: isRtl ? "إدارة التصنيفات" : "Categories",
      desc: isRtl ? "إضافة وتعديل وحذف تصنيفات المنتجات" : "Manage categories",
      icon: FolderOpen,
    },
    {
      href: `/${locale}/admin/ads`,
      title: isRtl ? "إدارة الإعلانات" : "Ads",
      desc: isRtl ? "مراجعة أي إعلان في الموقع" : "Review ads",
      icon: Package,
    },
    {
      href: `/${locale}/admin/commissions`,
      title: isRtl ? "تحصيل العمولات" : "Commissions",
      desc: isRtl ? "تحصيل رصيد العمولة المعلق" : "Collect pending fees",
      icon: HandCoins,
    },
    {
      href: `/${locale}/admin/banned`,
      title: isRtl ? "الحسابات المجمدة" : "Suspended",
      desc: isRtl ? "حسابات بائعين ومشترين مجمدة" : "Frozen accounts",
      icon: Lock,
    },
    {
      href: `/${locale}/admin/transactions`,
      title: isRtl ? "وسيط قريب" : "Escrow",
      desc: isRtl ? "صفقات الوسيط والمدفوعات" : "Escrow deals",
      icon: Shield,
    },
    {
      href: `/${locale}/legal-advisor/inbox`,
      title: isRtl ? "المستشار القانوني" : "Legal advisor",
      desc: isRtl ? "الاستشارات والطلبات الموجهة" : "Consultations",
      icon: Scale,
    },
    {
      href: `/${locale}/admin/sellers?status=PENDING`,
      title: isRtl ? "طلبات تسجيل بائع" : "Seller applications",
      desc: isRtl ? `${s.sellerApps || 0} طلب بانتظار المراجعة` : "Pending applications",
      icon: FileCheck,
    },
  ]

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900">
          {isRtl ? "نظرة عامة" : "Overview"}
        </h1>
        <Link href={`/${locale}`} className="text-sm text-orange-600 font-medium">
          {isRtl ? "رجوع للموقع" : "Back to site"}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topStats.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center"
          >
            <div className="text-2xl font-bold text-emerald-800">{c.value ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          {isRtl ? "الأقسام" : "Sections"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((sec) => (
            <Link
              key={sec.href + sec.title}
              href={sec.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition flex gap-3 items-start"
            >
              <sec.icon className="text-emerald-700 shrink-0 mt-0.5" size={22} />
              <div>
                <div className="font-semibold text-gray-900">{sec.title}</div>
                <div className="text-xs text-gray-500 mt-1">{sec.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {(data.pendingSellers || []).length > 0 && (
        <div className="bg-white rounded-2xl border p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingBag size={18} />
            {isRtl ? "طلبات بائعين بانتظار الموافقة" : "Pending seller applications"}
          </h2>
          <ul className="space-y-3">
            {data.pendingSellers.map((a: any) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-3 text-sm"
              >
                <div>
                  <div className="font-medium">{a.fullName} — {a.shopName}</div>
                  <div className="text-xs text-gray-500" dir="ltr">
                    {a.phone} · {a.businessType} · {a.verifyLevel}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy === a.id}
                    onClick={() => decide(a.id, "APPROVE")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
                  >
                    {isRtl ? "موافقة" : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={busy === a.id}
                    onClick={() => decide(a.id, "REJECT")}
                    className="px-3 py-1.5 rounded-lg border text-xs font-medium text-red-600"
                  >
                    {isRtl ? "رفض" : "Reject"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
