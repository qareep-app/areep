"use client"

import { useEffect, useState } from "react"
import { Receipt, Loader2, CreditCard, AlertTriangle } from "lucide-react"

export default function CommissionsPanel({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [totals, setTotals] = useState({ pending: 0, overdue: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [dealAmount, setDealAmount] = useState("")
  const [adId, setAdId] = useState("")
  const [msg, setMsg] = useState("")

  const load = () => {
    setLoading(true)
    fetch("/api/commission/invoices", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setTotals(d.totals || { pending: 0, overdue: 0, count: 0 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    setMsg("")
    setBusy("create")
    try {
      const r = await fetch("/api/commission/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dealAmount: Number(dealAmount),
          adId: adId || undefined,
          source: "COD",
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "fail")
      setDealAmount("")
      setAdId("")
      setMsg(isRtl ? "تم إنشاء فاتورة العمولة" : "Invoice created")
      load()
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setBusy(null)
    }
  }

  const pay = async (id: string) => {
    setBusy(id)
    setMsg("")
    try {
      const r = await fetch("/api/commission/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action: "pay" }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "fail")
      if (d.iframeUrl) {
        window.location.href = d.iframeUrl
        return
      }
      setMsg(d.message || (isRtl ? "تم" : "Done"))
      load()
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="text-emerald-600" size={26} />
          {isRtl ? "عمولاتي" : "My commissions"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "بعد بيع عادي (دفع عند الاستلام): سجّل البيعة هنا. العمولة تُحسب من قيمة البيعة. التأخير يمنع نشر/تمييز إعلانات جديدة."
            : "After a COD sale: register the deal here. Fee is calculated from deal amount. Overdue invoices block new/featured ads."}
        </p>
      </div>

      {totals.overdue > 0 && (
        <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 text-sm flex gap-2">
          <AlertTriangle className="shrink-0" size={18} />
          {isRtl
            ? `عمولات متأخرة: ${totals.overdue.toLocaleString()} ج.م — لن تقدر تنشر أو تميّز إعلان قبل السداد.`
            : `Overdue: ${totals.overdue.toLocaleString()} EGP — posting/featuring blocked until paid.`}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-gray-500">{isRtl ? "معلق" : "Pending"}</div>
          <div className="text-2xl font-bold">{totals.pending.toLocaleString()} ج</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-gray-500">{isRtl ? "متأخر" : "Overdue"}</div>
          <div className="text-2xl font-bold text-red-600">{totals.overdue.toLocaleString()} ج</div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold">{isRtl ? "تسجيل بيعة عادية / عند الاستلام" : "Register COD sale"}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className="border rounded-xl px-3 py-2 text-sm"
            type="number"
            placeholder={isRtl ? "قيمة البيعة (جنيه)" : "Deal amount (EGP)"}
            value={dealAmount}
            onChange={(e) => setDealAmount(e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2 text-sm font-mono"
            dir="ltr"
            placeholder={isRtl ? "معرف الإعلان (اختياري)" : "Ad id (optional)"}
            value={adId}
            onChange={(e) => setAdId(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={busy === "create" || !dealAmount}
          onClick={create}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {busy === "create" ? <Loader2 className="animate-spin inline" size={16} /> : null}{" "}
          {isRtl ? "إنشاء فاتورة 2%" : "Create 2% invoice"}
        </button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-sm">{isRtl ? "الفواتير" : "Invoices"}</div>
        {loading && (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        )}
        {!loading && items.length === 0 && (
          <p className="p-6 text-sm text-gray-400 text-center">{isRtl ? "لا فواتير" : "No invoices"}</p>
        )}
        <div className="divide-y">
          {items.map((inv) => (
            <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-medium">
                  {Number(inv.feeAmount).toLocaleString()} ج{" "}
                  <span className="text-xs text-gray-400">
                    ({inv.feePercent}% × {Number(inv.dealAmount).toLocaleString()})
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {inv.status}
                  {inv.isOverdue && (
                    <span className="text-red-600 font-semibold ms-2">
                      {isRtl ? "متأخرة" : "OVERDUE"}
                    </span>
                  )}
                  {inv.dueAt && (
                    <span className="ms-2">
                      {isRtl ? "استحقاق:" : "Due:"}{" "}
                      {new Date(inv.dueAt).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
              </div>
              {inv.status === "PENDING" && (
                <button
                  type="button"
                  disabled={busy === inv.id}
                  onClick={() => pay(inv.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
                >
                  {busy === inv.id ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <CreditCard size={14} />
                  )}
                  {isRtl ? "سداد عبر Paymob" : "Pay with Paymob"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
