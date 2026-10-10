"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pause, Play, Trash2, Pencil, MessageCircle, Eye } from "lucide-react"

export default function AdminAds({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch("/api/admin/ads?limit=80", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRows(d.ads || d.items || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: "PAUSE" | "ACTIVATE" | "DELETE") => {
    setBusy(id + action)
    await fetch("/api/admin/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, action }),
    })
    setBusy(null)
    load()
  }

  if (loading) return <p className="text-sm text-gray-500">...</p>

  return (
    <div className="bg-white rounded-2xl border divide-y">
      {rows.length === 0 && (
        <p className="p-6 text-center text-gray-400">{isRtl ? "لا إعلانات" : "No ads"}</p>
      )}
      {rows.map((a) => {
        const img = Array.isArray(a.images) && a.images[0] ? a.images[0] : null
        const seller = a.user?.name || a.user?.phone || "—"
        return (
          <div key={a.id} className="p-4 flex flex-col sm:flex-row gap-4 text-sm">
            <div className="w-full sm:w-28 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{a.titleAr || a.titleEn}</div>
              <div className="text-gray-500 mt-0.5">
                {Number(a.price || 0).toLocaleString()} {a.currency || "EGP"} · {a.city || "—"} · {a.status}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isRtl ? "المعلن:" : "Seller:"}{" "}
                <span className="font-medium text-gray-700">{seller}</span>
                {" · "}
                <Eye size={12} className="inline" /> {a.views || 0}
                {a.category?.nameAr ? ` · ${a.category.nameAr}` : ""}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <Link
                href={`/${locale}/ads/${a.id}`}
                className="px-2.5 py-1.5 rounded-lg border text-xs hover:bg-gray-50"
              >
                {isRtl ? "عرض" : "View"}
              </Link>
              <button
                type="button"
                disabled={busy === a.id + "PAUSE"}
                onClick={() => act(a.id, a.status === "PAUSED" ? "ACTIVATE" : "PAUSE")}
                className="px-2.5 py-1.5 rounded-lg border text-xs hover:bg-amber-50 text-amber-800 inline-flex items-center gap-1"
              >
                {a.status === "PAUSED" ? <Play size={14} /> : <Pause size={14} />}
                {a.status === "PAUSED" ? (isRtl ? "تشغيل" : "Activate") : (isRtl ? "إيقاف" : "Pause")}
              </button>
              <Link
                href={`/${locale}/ads/new?edit=${a.id}`}
                className="px-2.5 py-1.5 rounded-lg border text-xs hover:bg-blue-50 text-blue-800 inline-flex items-center gap-1"
              >
                <Pencil size={14} />
                {isRtl ? "تعديل" : "Edit"}
              </Link>
              <Link
                href={`/${locale}/messages?user=${a.userId || a.user?.id || ""}`}
                className="px-2.5 py-1.5 rounded-lg border text-xs hover:bg-emerald-50 text-emerald-800 inline-flex items-center gap-1"
              >
                <MessageCircle size={14} />
                {isRtl ? "تواصل" : "Contact"}
              </Link>
              <button
                type="button"
                disabled={busy === a.id + "DELETE"}
                onClick={() => {
                  if (confirm(isRtl ? "حذف الإعلان؟" : "Delete ad?")) act(a.id, "DELETE")
                }}
                className="px-2.5 py-1.5 rounded-lg border text-xs hover:bg-red-50 text-red-700 inline-flex items-center gap-1"
              >
                <Trash2 size={14} />
                {isRtl ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
