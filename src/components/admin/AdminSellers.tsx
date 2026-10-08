"use client"

import { useEffect, useState } from "react"

export default function AdminSellers({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [msg, setMsg] = useState("")

  const load = () => {
    fetch("/api/seller/apply")
      .then((r) => r.json())
      .then((d) => setRows(d.applications || d.items || []))
      .catch(() => setRows([]))
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: string) => {
    setMsg("")
    const res = await fetch("/api/seller/apply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    })
    const d = await res.json()
    if (!res.ok) setMsg(d.error || "failed")
    else {
      setMsg(isRtl ? "تم" : "Done")
      load()
    }
  }

  return (
    <div className="space-y-3">
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
              {r.businessName || r.fullName || r.phone} — {r.status}
            </div>
            <div className="text-gray-500" dir="ltr">
              {r.phone} · {r.businessType}
            </div>
            {r.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => act(r.id, "APPROVE")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs"
                >
                  {isRtl ? "موافقة" : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => act(r.id, "REJECT")}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                >
                  {isRtl ? "رفض" : "Reject"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
