"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react"

interface MyAdsListProps {
  locale: string
}

export default function MyAdsList({ locale }: MyAdsListProps) {
  const isRtl = locale === "ar"
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadAds = () => {
    setLoading(true)
    fetch("/api/ads?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAds(data.ads || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAds()
  }, [])

  const statusLabel = (s: string) => {
    const map: Record<string, { ar: string; en: string; cls: string }> = {
      ACTIVE: { ar: "نشط", en: "Active", cls: "bg-emerald-50 text-emerald-700" },
      PENDING: { ar: "قيد المراجعة", en: "Pending", cls: "bg-amber-50 text-amber-700" },
      SOLD: { ar: "تم البيع", en: "Sold", cls: "bg-gray-100 text-gray-600" },
      PAUSED: { ar: "متوقف", en: "Paused", cls: "bg-red-50 text-red-600" },
    }
    return map[s] || map.ACTIVE
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? "إعلاناتي" : "My Ads"}
        </h1>
        <Link
          href={`/${locale}/ads/new`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-full text-sm"
        >
          <Plus size={18} />
          {isRtl ? "أضف إعلان" : "Post Ad"}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-12 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            {isRtl ? "جاري التحميل..." : "Loading..."}
          </div>
        )}

        {!loading && ads.length === 0 && (
          <div className="p-12 text-center text-gray-500 text-sm">
            {isRtl ? "مفيش إعلانات لسه" : "No ads yet"}
            <div className="mt-3">
              <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium">
                {isRtl ? "أضف إعلانك الأول" : "Post your first ad"}
              </Link>
            </div>
          </div>
        )}

        {!loading && ads.length > 0 && (
          <div className="divide-y divide-gray-50">
            {ads.map((ad) => {
              const st = statusLabel(ad.status || "ACTIVE")
              return (
                <div key={ad.id} className="flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                    {ad.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/${locale}/ads/${ad.id}`} className="font-medium text-gray-900 truncate hover:text-emerald-700 block">
                      {isRtl ? ad.titleAr : ad.titleEn || ad.titleAr}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Eye size={14} /> {ad.views || 0}</span>
                      {ad.allowEscrow && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 font-medium text-xs">
                            {isRtl ? "وسيط مفعل" : "Escrow on"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.cls}`}>
                    {isRtl ? st.ar : st.en}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
