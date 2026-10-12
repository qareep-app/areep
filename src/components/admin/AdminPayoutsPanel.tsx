"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function AdminPayoutsPanel({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [pending, setPending] = useState<any[]>([])
  const [paid, setPaid] = useState<any[]>([])
  const [totals, setTotals] = useState({ pendingAmount: 0, paidAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [refs, setRefs] = useState<Record<string, string>>({})

  const load = () => {
    setLoading(true)
    fetch("/api/admin/payouts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setPending(d.pending || [])
        setPaid(d.paid || [])
        setTotals(d.totals || { pendingAmount: 0, paidAmount: 0 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const markPaid = async (id: string) => {
    setBusy(id)
    try {
      const r = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id,
          action: "mark_paid",
          payoutRef: refs[id] || "",
          payoutMethod: "manual",
        }),
      })
      const d = await r.json()
      if (!r.ok) alert(d.error || "fail")
      load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {isRtl
            ? "بعد اكتمال الوسيط (RELEASED): حوّل صافي البائع يدوياً ثم سجّل «تم الصرف»."
            : "After escrow RELEASED: transfer seller net manually, then mark paid out."}
        </p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border rounded-lg"
        >
          <RefreshCw size={14} /> {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="text-xs text-amber-800">{isRtl ? "مستحق ولم يُصرف" : "Pending payout"}</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {totals.pendingAmount.toLocaleString()} ج
          </div>
          <div className="text-xs text-amber-700 mt-1">{pending.length} {isRtl ? "صفقة" : "deals"}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="text-xs text-emerald-800">{isRtl ? "تم صرفه" : "Paid out"}</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {totals.paidAmount.toLocaleString()} ج
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center p-8 text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          <h2 className="font-semibold">{isRtl ? "بانتظار الصرف" : "Awaiting payout"}</h2>
          {pending.length === 0 && (
            <p className="text-sm text-gray-400">{isRtl ? "لا مستحقات حالياً" : "No pending payouts"}</p>
          )}
          {pending.map((row) => (
            <div key={row.id} className="bg-white border rounded-2xl p-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="font-semibold">{row.ad?.titleAr || row.id.slice(-8)}</div>
                  <div className="text-sm text-gray-500">
                    {isRtl ? "صافي البائع:" : "Seller net:"}{" "}
                    <strong className="text-emerald-700">{row.sellerNet.toLocaleString()} ج</strong>
                    {" · "}
                    {isRtl ? "عمولة قريب:" : "Fee:"} {row.platformFee.toLocaleString()}
                  </div>
                </div>
                {!row.hasPayoutInfo && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <AlertCircle size={12} />
                    {isRtl ? "البائع لم يضف حساب استلام" : "No seller payout info"}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 font-mono" dir="ltr">
                {row.seller?.name || "—"} | {row.seller?.phone || "—"}
                <br />
                Bank: {row.seller?.bankName || "—"} / {row.seller?.bankAccountName || "—"} /{" "}
                {row.seller?.bankAccountNumber || "—"}
                <br />
                Wallet: {row.seller?.walletType || "—"} {row.seller?.walletNumber || ""}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px]"
                  placeholder={isRtl ? "رقم مرجع التحويل" : "Transfer reference"}
                  value={refs[row.id] || ""}
                  onChange={(e) => setRefs((x) => ({ ...x, [row.id]: e.target.value }))}
                />
                <button
                  type="button"
                  disabled={busy === row.id}
                  onClick={() => markPaid(row.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {busy === row.id ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  {isRtl ? "تم الصرف" : "Mark paid out"}
                </button>
              </div>
            </div>
          ))}

          {paid.length > 0 && (
            <>
              <h2 className="font-semibold pt-4">{isRtl ? "تم الصرف" : "Paid out"}</h2>
              {paid.slice(0, 20).map((row) => (
                <div key={row.id} className="bg-white border rounded-xl p-3 text-sm text-gray-600 flex justify-between gap-2">
                  <span>
                    {row.ad?.titleAr || row.id.slice(-6)} — {row.sellerNet.toLocaleString()} ج
                  </span>
                  <span className="text-xs text-gray-400" dir="ltr">
                    {row.payoutRef || "—"}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
