"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Eye,
  Pencil,
  Loader2,
  RefreshCw,
  Star,
  Clock,
} from "lucide-react"

interface MyAdsListProps {
  locale: string
}

function daysLeft(expiresAt?: string | null) {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(ms / 86400000)
}

export default function MyAdsList({ locale }: MyAdsListProps) {
  const isRtl = locale === "ar"
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  const loadAds = () => {
    setLoading(true)
    fetch("/api/ads?mine=1&limit=50", { credentials: "include" })
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

  const statusLabel = (ad: any) => {
    const left = daysLeft(ad.expiresAt)
    const expired =
      ad.status === "EXPIRED" || (left !== null && left < 0)
    if (expired)
      return {
        ar: "منتهي",
        en: "Expired",
        cls: "bg-red-50 text-red-700",
      }
    const map: Record<string, { ar: string; en: string; cls: string }> = {
      ACTIVE: { ar: "نشط", en: "Active", cls: "bg-emerald-50 text-emerald-700" },
      PENDING: {
        ar: "قيد المراجعة",
        en: "Pending",
        cls: "bg-amber-50 text-amber-700",
      },
      SOLD: { ar: "تم البيع", en: "Sold", cls: "bg-gray-100 text-gray-600" },
      PAUSED: { ar: "متوقف", en: "Paused", cls: "bg-red-50 text-red-600" },
    }
    return map[ad.status] || map.ACTIVE
  }

  const renew = async (id: string) => {
    setBusyId(id)
    setMsg("")
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renew" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "failed")
      setMsg(isRtl ? "تم تجديد الإعلان 30 يوم" : "Ad renewed for 30 days")
      loadAds()
    } catch (e: any) {
      setMsg(e.message || "error")
    } finally {
      setBusyId(null)
    }
  }

  const promote = async (id: string, on: boolean) => {
    setBusyId(id)
    setMsg("")
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: on }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "failed")
      setMsg(
        on
          ? isRtl
            ? "تم ترقية الإعلان لمميز"
            : "Ad promoted"
          : isRtl
            ? "تم إلغاء التمييز"
            : "Feature removed"
      )
      loadAds()
    } catch (e: any) {
      setMsg(e.message || "error")
    } finally {
      setBusyId(null)
    }
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

      {msg && (
        <div className="text-sm rounded-xl border px-3 py-2 bg-emerald-50 text-emerald-900 border-emerald-100">
          {msg}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {isRtl
          ? "مدة الإعلان 30 يومًا. بعد الانتهاء جدّده أو رقِّه لمميز من الأزرار بالأسفل."
          : "Each ad lasts 30 days. Renew or promote after expiry."}
      </p>

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
              <Link
                href={`/${locale}/ads/new`}
                className="text-emerald-600 font-medium"
              >
                {isRtl ? "أضف إعلانك الأول" : "Post your first ad"}
              </Link>
            </div>
          </div>
        )}

        {!loading && ads.length > 0 && (
          <div className="divide-y divide-gray-50">
            {ads.map((ad) => {
              const st = statusLabel(ad)
              const left = daysLeft(ad.expiresAt)
              const expired =
                ad.status === "EXPIRED" || (left !== null && left < 0)
              const busy = busyId === ad.id

              return (
                <div
                  key={ad.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                      {ad.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ad.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${locale}/ads/${ad.id}`}
                        className="font-medium text-gray-900 truncate hover:text-emerald-700 block"
                      >
                        {isRtl ? ad.titleAr : ad.titleEn || ad.titleAr}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>
                          {Number(ad.price).toLocaleString()}{" "}
                          {isRtl ? "جنيه" : "EGP"}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} /> {ad.views || 0}
                        </span>
                        {ad.isFeatured && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 font-medium text-xs flex items-center gap-0.5">
                              <Star size={12} /> {isRtl ? "مميز" : "Featured"}
                            </span>
                          </>
                        )}
                        {left !== null && (
                          <>
                            <span>·</span>
                            <span
                              className={`flex items-center gap-0.5 text-xs ${
                                expired
                                  ? "text-red-600"
                                  : left <= 7
                                    ? "text-amber-600"
                                    : "text-gray-500"
                              }`}
                            >
                              <Clock size={12} />
                              {expired
                                ? isRtl
                                  ? "انتهت المدة"
                                  : "Expired"
                                : isRtl
                                  ? `${left} يوم متبقي`
                                  : `${left}d left`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.cls}`}
                    >
                      {isRtl ? st.ar : st.en}
                    </span>
                  </div>

                  {/* أزرار المالك — ظاهرة دائمًا */}
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Link
                      href={`/${locale}/ads/${ad.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                    >
                      <Pencil size={14} />
                      {isRtl ? "تعديل" : "Edit"}
                    </Link>
                    <Link
                      href={`/${locale}/ads/${ad.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium hover:bg-gray-50"
                    >
                      <Eye size={14} />
                      {isRtl ? "عرض" : "View"}
                    </Link>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => renew(ad.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 text-xs font-semibold hover:bg-sky-100 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      {isRtl ? "تجديد 30 يوم" : "Renew 30d"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => promote(ad.id, !ad.isFeatured)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 disabled:opacity-50"
                    >
                      <Star size={14} />
                      {ad.isFeatured
                        ? isRtl
                          ? "إلغاء مميز"
                          : "Unfeature"
                        : isRtl
                          ? "ترقية لمميز"
                          : "Promote"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
