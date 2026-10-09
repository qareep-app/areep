"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function TransactionsPanel({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/transactions", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusLabel = (s: string) => {
    const map: Record<string, { ar: string; en: string; cls: string }> = {
      COMPLETED: { ar: "مكتملة", en: "Completed", cls: "bg-emerald-50 text-emerald-700" },
      PENDING: { ar: "قيد الانتظار", en: "Pending", cls: "bg-amber-50 text-amber-700" },
      CANCELLED: { ar: "ملغاة", en: "Cancelled", cls: "bg-red-50 text-red-600" },
      completed: { ar: "مكتملة", en: "Completed", cls: "bg-emerald-50 text-emerald-700" },
      pending: { ar: "قيد الانتظار", en: "Pending", cls: "bg-amber-50 text-amber-700" },
    }
    return map[s] || { ar: s, en: s, cls: "bg-gray-100 text-gray-600" }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">
        {isRtl ? "المعاملات والعمولات" : "Transactions & Commissions"}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-12 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            {isRtl ? "جاري التحميل..." : "Loading..."}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-12 text-center text-gray-500 text-sm">
            {isRtl
              ? "مفيش معاملات لسه. لما تتم صفقة هتظهر هنا مع العمولة."
              : "No transactions yet. Completed deals will appear here with fees."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-start px-5 py-3 font-medium">{isRtl ? "الإعلان" : "Ad"}</th>
                  <th className="text-start px-5 py-3 font-medium">{isRtl ? "المبلغ" : "Amount"}</th>
                  <th className="text-start px-5 py-3 font-medium">{isRtl ? "عمولة قريب" : "Areep Fee"}</th>
                  <th className="text-start px-5 py-3 font-medium">{isRtl ? "الحالة" : "Status"}</th>
                  <th className="text-start px-5 py-3 font-medium">{isRtl ? "التاريخ" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((t) => {
                  const st = statusLabel(t.status || "PENDING")
                  const title = t.ad?.titleAr || t.adTitle || "—"
                  const amount = Number(t.amount || t.totalAmount || 0)
                  const fee = Number(t.commission || t.platformFee || 0)
                  const date = t.createdAt
                    ? new Date(t.createdAt).toISOString().slice(0, 10)
                    : "—"
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{title}</td>
                      <td className="px-5 py-3">
                        {amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                      </td>
                      <td className="px-5 py-3 text-emerald-700 font-medium">
                        {fee.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.cls}`}>
                          {isRtl ? st.ar : st.en}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        {isRtl
          ? "العمولات تُحسب تلقائياً حسب قواعد كل فئة (2% أو 2.5% مع الوسيط). لا يمكن إتمام أي صفقة بدون احتساب العمولة."
          : "Fees are calculated automatically per category rules (2% or 2.5% with escrow). No deal completes without the platform fee."}
      </p>
    </div>
  )
}
