"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Megaphone, Eye, MessageCircle, TrendingUp, Plus, ArrowUpRight } from "lucide-react"

interface DashboardOverviewProps {
  locale: string
}

export default function DashboardOverview({ locale }: DashboardOverviewProps) {
  const isRtl = locale === "ar"
  const [ads, setAds] = useState<any[]>([])
  const [stats, setStats] = useState({ ads: 0, views: 0 })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.user?.role === "ADMIN"))
      .catch(() => {})
    fetch("/api/ads?limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const list = data.ads || []
          setAds(list)
          setStats({
            ads: list.length,
            views: list.reduce((s: number, a: any) => s + (a.views || 0), 0),
          })
        }
      })
      .catch(() => {})
  }, [])

  const cards = [
    { labelAr: "إعلانات نشطة", labelEn: "Active Ads", value: String(stats.ads), icon: Megaphone, color: "bg-blue-50 text-blue-600" },
    { labelAr: "المشاهدات", labelEn: "Views", value: String(stats.views), icon: Eye, color: "bg-violet-50 text-violet-600" },
    { labelAr: "رسائل جديدة", labelEn: "New Messages", value: "0", icon: MessageCircle, color: "bg-orange-50 text-orange-600" },
    { labelAr: "مبيعات هذا الشهر", labelEn: "Sales this month", value: "0", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
  ]

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Link
          href={`/${locale}/admin`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
        >
          <span>{isRtl ? "أنت أدمن — فتح لوحة تحكم الموقع" : "You are admin — open site control panel"}</span>
          <span className="text-emerald-700">←</span>
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isRtl ? "مرحباً 👋" : "Welcome 👋"}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRtl ? "إليك ملخص نشاطك على قريب" : "Here's a summary of your activity on Areep"}
          </p>
        </div>
        <Link href={`/${locale}/ads/new`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-full text-sm shadow-sm transition">
          <Plus size={18} />
          {isRtl ? "أضف إعلان" : "Post Ad"}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{isRtl ? stat.labelAr : stat.labelEn}</div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isRtl ? "أحدث إعلاناتك" : "Your Recent Ads"}</h2>
          <Link href={`/${locale}/dashboard/ads`} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            {isRtl ? "عرض الكل" : "View all"}
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {ads.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {isRtl ? "مفيش إعلانات لسه" : "No ads yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {ads.map((ad) => (
              <Link key={ad.id} href={`/${locale}/ads/${ad.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                  {ad.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {isRtl ? ad.titleAr : ad.titleEn || ad.titleAr}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {ad.views || 0} {isRtl ? "مشاهدة" : "views"} · {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {isRtl ? "نشط" : "Active"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
