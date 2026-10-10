"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pause, Play, Trash2, Pencil, MessageCircle, ExternalLink, RefreshCw } from "lucide-react"

export default function AdminAds({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      let r = await fetch("/api/admin/ads?limit=80", { credentials: "include" })
      let d = await r.json().catch(() => ({}))
      if (!r.ok) {
        // fallback public list (still show actions if admin session works on PATCH)
        r = await fetch("/api/ads?limit=50", { credentials: "include" })
        d = await r.json().catch(() => ({}))
      }
      const list = d.ads || d.items || []
      setRows(Array.isArray(list) ? list : [])
      if (!r.ok && !list.length) {
        setError(d.error || (isRtl ? "تعذر تحميل الإعلانات" : "Failed to load ads"))
      }
    } catch (e: any) {
      setError(e?.message || "error")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: "PAUSE" | "ACTIVATE" | "DELETE" | "FEATURE" | "UNFEATURE") => {
    setBusy(id + action)
    try {
      const r = await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        alert(d.error || (isRtl ? "فشل الإجراء" : "Action failed"))
      }
    } finally {
      setBusy(null)
      load()
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-gray-500 p-4">
        {isRtl ? "جاري تحميل الإعلانات..." : "Loading ads..."}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          {isRtl ? `عدد الإعلانات: ${rows.length}` : `Ads: ${rows.length}`}
        </p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border divide-y">
        {rows.length === 0 && (
          <p className="p-8 text-center text-gray-400 text-sm">
            {isRtl ? "لا توجد إعلانات" : "No ads"}
          </p>
        )}

        {rows.map((a) => {
          const img = Array.isArray(a.images) && a.images[0] ? a.images[0] : null
          const seller = a.user?.name || a.user?.phone || a.userId || "—"
          const paused = a.status === "PAUSED"
          return (
            <div key={a.id} className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-24 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    {a.titleAr || a.titleEn || "—"}
                  </div>
                  <div className="text-gray-600 text-sm mt-0.5">
                    {Number(a.price || 0).toLocaleString()} {a.currency || "EGP"}
                    {" · "}
                    {a.city || "—"}
                    {" · "}
                    <span className={paused ? "text-amber-700" : "text-emerald-700"}>
                      {a.status || "—"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>{isRtl ? "المعلن:" : "Seller:"}</strong> {seller}
                    {a.category?.nameAr ? ` · ${a.category.nameAr}` : ""}
                    {` · ${a.views || 0} ${isRtl ? "مشاهدة" : "views"}`}
                  </div>
                </div>
              </div>

              {/* أزرار واضحة دائماً */}
              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Link
                  href={`/${locale}/ads/${a.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black"
                >
                  <ExternalLink size={14} />
                  {isRtl ? "عرض" : "View"}
                </Link>

                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act(a.id, paused ? "ACTIVATE" : "PAUSE")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200 disabled:opacity-50"
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                  {paused ? (isRtl ? "تشغيل" : "Activate") : (isRtl ? "إيقاف" : "Pause")}
                </button>

                <Link
                  href={`/${locale}/ads/new?edit=${a.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-100 text-blue-900 text-xs font-semibold hover:bg-blue-200"
                >
                  <Pencil size={14} />
                  {isRtl ? "تعديل" : "Edit"}
                </Link>

                <Link
                  href={`/${locale}/messages?user=${a.userId || a.user?.id || ""}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold hover:bg-emerald-200"
                >
                  <MessageCircle size={14} />
                  {isRtl ? "تواصل" : "Contact"}
                </Link>


                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act(a.id, a.isFeatured ? "UNFEATURE" : "FEATURE")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200 disabled:opacity-50"
                >
                  {a.isFeatured ? (isRtl ? "إلغاء التمييز" : "Unfeature") : (isRtl ? "تمييز" : "Feature")}
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => {
                    if (confirm(isRtl ? "حذف الإعلان نهائياً؟" : "Delete this ad?")) {
                      act(a.id, "DELETE")
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 text-red-800 text-xs font-semibold hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {isRtl ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
