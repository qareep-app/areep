"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Pause,
  Play,
  Trash2,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  Star,
} from "lucide-react"

async function fetchWithTimeout(url: string, ms = 12000): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { credentials: "include", signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

export default function AdminAds({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      let list: any[] = []
      let lastErr = ""

      try {
        const r = await fetchWithTimeout("/api/admin/ads?limit=80", 12000)
        const d = await r.json().catch(() => ({}))
        if (r.ok) {
          list = d.ads || d.items || []
        } else {
          lastErr = d.error || `admin ${r.status}`
        }
      } catch (e: any) {
        lastErr = e?.name === "AbortError" ? "timeout" : e?.message || "fetch error"
      }

      // fallback قائمة عامة
      if (!list.length) {
        try {
          const r2 = await fetchWithTimeout("/api/ads?limit=50", 10000)
          const d2 = await r2.json().catch(() => ({}))
          if (r2.ok) {
            list = d2.ads || []
            if (list.length && lastErr) {
              // عندنا بيانات من المسار العام
              lastErr = ""
            }
          } else if (!lastErr) {
            lastErr = d2.error || `ads ${r2.status}`
          }
        } catch (e: any) {
          if (!lastErr) lastErr = e?.message || "fallback error"
        }
      }

      setRows(Array.isArray(list) ? list : [])
      if (lastErr && !(Array.isArray(list) && list.length)) {
        setError(
          lastErr === "timeout"
            ? isRtl
              ? "انتهت مهلة التحميل — اضغط تحديث"
              : "Load timed out — retry"
            : lastErr === "Unauthorized"
              ? isRtl
                ? "غير مصرح — تأكد أن رقمك في ADMIN_PHONES"
                : "Unauthorized — check ADMIN_PHONES"
              : lastErr
        )
      }
    } catch (e: any) {
      setError(e?.message || "error")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [isRtl])

  useEffect(() => {
    load()
  }, [load])

  const act = async (
    id: string,
    action: "PAUSE" | "ACTIVATE" | "DELETE" | "FEATURE" | "UNFEATURE"
  ) => {
    if (action === "DELETE" && !confirm(isRtl ? "حذف الإعلان؟" : "Delete ad?")) return
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
      <div className="p-6 text-center space-y-3">
        <p className="text-sm text-gray-500">
          {isRtl ? "جاري تحميل الإعلانات..." : "Loading ads..."}
        </p>
        <button
          type="button"
          onClick={() => load()}
          className="text-sm text-emerald-700 underline"
        >
          {isRtl ? "إلغاء والضغط للتحديث" : "Retry"}
        </button>
      </div>
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
          onClick={() => load()}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {rows.length === 0 && !error && (
        <p className="text-center text-gray-400 py-10 text-sm">
          {isRtl ? "لا توجد إعلانات" : "No ads"}
        </p>
      )}

      <div className="bg-white rounded-2xl border divide-y">
        {rows.map((a) => {
          const img =
            Array.isArray(a.images) && a.images[0]
              ? a.images[0]
              : typeof a.images === "string"
                ? a.images
                : null
          const seller = a.user?.name || a.user?.phone || a.userId || "—"
          return (
            <div
              key={a.id}
              className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center"
            >
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate flex items-center gap-1">
                    {a.isFeatured && <Star size={14} className="text-amber-500 shrink-0" />}
                    {a.titleAr || a.titleEn || a.id}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 space-x-1 space-x-reverse">
                    <span className="text-emerald-700 font-medium">
                      {a.price != null
                        ? `${Number(a.price).toLocaleString()} ${a.currency || "EGP"}`
                        : "—"}
                    </span>
                    <span>·</span>
                    <span>{a.status}</span>
                    {a.category?.nameAr && (
                      <>
                        <span>·</span>
                        <span>{a.category.nameAr}</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">
                    {isRtl ? "المعلن:" : "Seller:"} {seller}
                    {a.city ? ` · ${a.city}` : ""}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 shrink-0">
                <Link
                  href={`/${locale}/ads/${a.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50"
                >
                  <ExternalLink size={12} />
                  {isRtl ? "عرض" : "View"}
                </Link>
                <Link
                  href={`/${locale}/messages?user=${a.userId || a.user?.id || ""}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50"
                >
                  <MessageCircle size={12} />
                  {isRtl ? "تواصل" : "Chat"}
                </Link>
                {a.status === "ACTIVE" ? (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => act(a.id, "PAUSE")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold"
                  >
                    <Pause size={12} />
                    {isRtl ? "إيقاف" : "Pause"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => act(a.id, "ACTIVATE")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold"
                  >
                    <Play size={12} />
                    {isRtl ? "تشغيل" : "Activate"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act(a.id, a.isFeatured ? "UNFEATURE" : "FEATURE")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 text-xs font-semibold"
                >
                  <Star size={12} />
                  {a.isFeatured
                    ? isRtl
                      ? "إلغاء تمييز"
                      : "Unfeature"
                    : isRtl
                      ? "تمييز"
                      : "Feature"}
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act(a.id, "DELETE")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold"
                >
                  <Trash2 size={12} />
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
