"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"

export default function AdminCommissionInvoices({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch("/api/admin/commission-invoices", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: string) => {
    await fetch("/api/admin/commission-invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, action }),
    })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={load} className="text-sm border rounded-lg px-3 py-1.5 inline-flex gap-1 items-center">
          <RefreshCw size={14} /> {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>
      {loading && <Loader2 className="animate-spin mx-auto text-gray-400" />}
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="bg-white border rounded-xl p-3 text-sm flex flex-wrap justify-between gap-2">
            <div>
              <strong>{Number(i.feeAmount).toLocaleString()} ج</strong>
              <span className="text-gray-500 ms-2">
                ({i.feePercent}% × {Number(i.dealAmount).toLocaleString()})
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {i.seller?.name || i.sellerId.slice(-6)} · {i.seller?.phone} · {i.status}
                {i.isOverdue && <span className="text-red-600 font-bold ms-1">OVERDUE</span>}
              </div>
            </div>
            {i.status === "PENDING" && (
              <div className="flex gap-2">
                <button type="button" className="px-2 py-1 border rounded-lg text-xs" onClick={() => act(i.id, "mark_paid")}>
                  {isRtl ? "تم السداد" : "Mark paid"}
                </button>
                <button type="button" className="px-2 py-1 border rounded-lg text-xs" onClick={() => act(i.id, "waive")}>
                  {isRtl ? "إعفاء" : "Waive"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
