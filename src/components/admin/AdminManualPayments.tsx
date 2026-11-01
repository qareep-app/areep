"use client"

import { useEffect, useState } from "react"
import { Loader2, Check, X } from "lucide-react"

export default function AdminManualPayments({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState("")

  const load = () => {
    setLoading(true)
    fetch("/api/admin/manual-payments", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setRows(d.requests || [])
        if (d.error) setErr(d.error)
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id)
    setErr("")
    try {
      const res = await fetch("/api/admin/manual-payments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "failed")
      load()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">
          {isRtl ? "مدفوعات يدوية (باقات)" : "Manual package payments"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "بعد التأكد من وصول إنستاباي / فودافون كاش اضغط تأكيد الدفع وتفعيل الباقة"
            : "Confirm transfer then activate package"}
        </p>
      </div>

      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {err}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm p-8 justify-center">
          <Loader2 className="animate-spin" size={18} />
          {isRtl ? "جاري التحميل..." : "Loading..."}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center text-gray-400 text-sm p-10 border rounded-2xl bg-white">
          {isRtl ? "لا توجد طلبات" : "No requests"}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border divide-y">
          {rows.map((r) => (
            <div
              key={r.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0 text-sm">
                <div className="font-semibold">
                  {r.packageSlug} · {Number(r.amount).toLocaleString()} EGP
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {r.user?.name || "—"} · {r.user?.phone || r.userId}
                </div>
                <div className="text-gray-500 text-xs">
                  {r.method} · ref: {r.reference || "—"} ·{" "}
                  {new Date(r.createdAt).toLocaleString(isRtl ? "ar-EG" : "en-GB")}
                </div>
                {r.note && (
                  <div className="text-xs text-gray-400 mt-0.5">{r.note}</div>
                )}
                <span
                  className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    r.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700"
                      : r.status === "REJECTED"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              {r.status === "PENDING" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={busy === r.id}
                    onClick={() => act(r.id, "approve")}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {busy === r.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {isRtl ? "تأكيد الدفع وتفعيل الباقة" : "Confirm & activate"}
                  </button>
                  <button
                    type="button"
                    disabled={busy === r.id}
                    onClick={() => act(r.id, "reject")}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-red-50 text-red-700 disabled:opacity-50"
                  >
                    <X size={14} />
                    {isRtl ? "رفض" : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
