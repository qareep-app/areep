"use client"

import { useEffect, useState } from "react"
import { Snowflake, Check, X, RefreshCw } from "lucide-react"

export default function AdminSellers({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = () => {
    fetch("/api/seller/apply", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRows(d.applications || d.items || []))
      .catch(() => setRows([]))
  }

  useEffect(() => {
    load()
  }, [])

  const actApp = async (id: string, action: string) => {
    setBusy(id + action)
    setMsg("")
    const res = await fetch("/api/seller/apply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, action }),
    })
    const d = await res.json()
    if (!res.ok) setMsg(d.error || "failed")
    else {
      setMsg(isRtl ? "تم" : "Done")
      load()
    }
    setBusy(null)
  }

  const actUser = async (userId: string, action: string) => {
    if (!userId) return
    setBusy(userId + action)
    setMsg("")
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: userId, action }),
    })
    const d = await res.json()
    if (!res.ok) setMsg(d.error || "failed")
    else {
      setMsg(isRtl ? "تم" : "Done")
      load()
    }
    setBusy(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {isRtl ? `طلبات البائعين: ${rows.length}` : `Seller apps: ${rows.length}`}
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
            {isRtl ? "لا طلبات بائعين" : "No seller applications"}
          </p>
        )}
        {rows.map((r) => (
          <div key={r.id} className="p-4 text-sm space-y-2">
            <div className="font-semibold">
              {r.shopName || r.businessName || r.fullName || r.phone} —{" "}
              <span
                className={
                  r.status === "PENDING"
                    ? "text-amber-600 font-normal"
                    : r.status === "APPROVED"
                      ? "text-emerald-600 font-normal"
                      : "text-gray-500 font-normal"
                }
              >
                {r.status}
              </span>
            </div>
            <div className="text-gray-600 text-xs space-y-0.5">
              <div>{isRtl ? "الاسم:" : "Name:"} {r.fullName || "—"}</div>
              <div dir="ltr">{r.phone} · {r.email || ""}</div>
              <div>
                {isRtl ? "النشاط:" : "Type:"} {r.businessType || "—"} ·{" "}
                {isRtl ? "توثيق:" : "Verify:"} {r.verifyLevel || "—"}
              </div>
              {(r.addressCity || r.addressDetail) && (
                <div>
                  {isRtl ? "العنوان:" : "Address:"} {r.addressDetail || ""}{" "}
                  {r.addressCity || ""}
                </div>
              )}
              {(r.bankAccountNumber || r.walletNumber) && (
                <div className="text-emerald-800 bg-emerald-50 rounded-lg px-2 py-1 mt-1 font-mono" dir="ltr">
                  {r.bankName || r.walletType || "payout"} / {r.bankAccountName || ""}{" "}
                  {r.bankAccountNumber || r.walletNumber}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {r.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => actApp(r.id, "APPROVE")}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                  >
                    <Check size={14} />
                    {isRtl ? "موافقة" : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => actApp(r.id, "REJECT")}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold"
                  >
                    <X size={14} />
                    {isRtl ? "رفض / إلغاء" : "Reject"}
                  </button>
                </>
              )}

              {(r.userId || r.user?.id) && (
                <>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => {
                      if (confirm(isRtl ? "تجميد حساب البائع؟" : "Freeze seller account?")) {
                        actUser(r.userId || r.user?.id, "BAN")
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold"
                  >
                    <Snowflake size={14} />
                    {isRtl ? "تجميد الحساب" : "Freeze"}
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => actUser(r.userId || r.user?.id, "SUSPEND_SELLER")}
                    className="px-3 py-2 rounded-lg bg-orange-100 text-orange-900 text-xs font-semibold"
                  >
                    {isRtl ? "إيقاف كبائع" : "Suspend seller"}
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => {
                      if (confirm(isRtl ? "تعطيل الحساب؟" : "Disable account?")) {
                        actUser(r.userId || r.user?.id, "DELETE")
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-800 text-xs font-semibold"
                  >
                    {isRtl ? "حذف/تعطيل" : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
