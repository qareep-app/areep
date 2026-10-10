"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Snowflake, Unlock, Store, Ban, RefreshCw } from "lucide-react"

export default function AdminUsers({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  const load = () => {
    setLoading(true)
    setErr("")
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error)
        setRows(d.users || [])
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: string) => {
    setBusy(id + action)
    setMsg("")
    try {
      const r = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action }),
      })
      const d = await r.json()
      if (!r.ok) setMsg(d.error || "failed")
      else setMsg(isRtl ? "تم التنفيذ" : "Done")
      load()
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">{isRtl ? "جاري التحميل..." : "Loading..."}</p>
  }
  if (err) return <p className="text-sm text-red-600">{err}</p>

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {isRtl ? `المستخدمون: ${rows.length}` : `Users: ${rows.length}`}
        </p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg"
        >
          <RefreshCw size={14} /> {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}

      <div className="bg-white rounded-2xl border divide-y">
        {rows.length === 0 && (
          <p className="p-6 text-center text-gray-400">
            {isRtl ? "لا يوجد مستخدمون بعد" : "No users yet"}
          </p>
        )}
        {rows.map((u) => (
          <div key={u.id} className="p-4 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-sm">
                  {u.name || (isRtl ? "بدون اسم" : "No name")}{" "}
                  <span className="text-gray-400 font-normal" dir="ltr">
                    {u.phone}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {u.role}
                  {" · "}
                  {u.isBanned ? (
                    <span className="text-red-600 font-semibold">{isRtl ? "مجمّد" : "Banned"}</span>
                  ) : (
                    <span className="text-emerald-700">{isRtl ? "نشط" : "Active"}</span>
                  )}
                  {" · "}
                  {isRtl ? "بائع:" : "Seller:"} {u.sellerStatus || "—"}
                  {" · "}
                  {u._count?.ads ?? 0} {isRtl ? "إعلان" : "ads"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {u.isBanned ? (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act(u.id, "UNBAN")}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold"
                >
                  <Unlock size={14} />
                  {isRtl ? "إلغاء التجميد" : "Unban"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => {
                    if (confirm(isRtl ? "تجميد الحساب؟" : "Freeze account?")) act(u.id, "BAN")
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold"
                >
                  <Snowflake size={14} />
                  {isRtl ? "تجميد" : "Freeze"}
                </button>
              )}

              {u.sellerStatus === "APPROVED" && (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act(u.id, "SUSPEND_SELLER")}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-100 text-orange-900 text-xs font-semibold"
                >
                  <Store size={14} />
                  {isRtl ? "إيقاف البائع" : "Suspend seller"}
                </button>
              )}

              {u.sellerStatus === "PENDING" && (
                <>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => act(u.id, "APPROVE_SELLER")}
                    className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                  >
                    {isRtl ? "موافقة بائع" : "Approve seller"}
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => act(u.id, "REJECT_SELLER")}
                    className="px-3 py-2 rounded-lg border text-xs font-semibold"
                  >
                    {isRtl ? "رفض بائع" : "Reject seller"}
                  </button>
                </>
              )}

              <Link
                href={`/${locale}/admin/ads?user=${u.id}`}
                className="px-3 py-2 rounded-lg border text-xs font-semibold hover:bg-gray-50"
              >
                {isRtl ? "إعلاناته" : "His ads"}
              </Link>

              <button
                type="button"
                disabled={!!busy}
                onClick={() => {
                  if (confirm(isRtl ? "حذف/تعطيل الحساب؟" : "Delete/disable account?")) {
                    act(u.id, "DELETE")
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 text-red-800 text-xs font-semibold"
              >
                <Ban size={14} />
                {isRtl ? "حذف/تعطيل" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
