"use client"

import { useEffect, useState } from "react"

export default function AdminLegal({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [msg, setMsg] = useState("")

  const load = () => {
    fetch("/api/legal/apply?status=PENDING")
      .then((r) => r.json())
      .then((d) => setRows(d.applications || []))
      .catch(() => setRows([]))
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: string) => {
    const res = await fetch("/api/legal/apply", {
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
            {isRtl ? "لا طلبات مستشارين قيد المراجعة" : "No pending legal applications"}
          </p>
        )}
        {rows.map((r) => (
          <div key={r.id} className="p-4 text-sm space-y-2">
            <div className="font-semibold">{r.fullName} — {r.status}</div>
            <div className="text-gray-500" dir="ltr">
              {r.phone} · {r.syndicateNo || ""}
            </div>
            <div className="flex gap-2 text-xs">
              {r.certificateUrl && (
                <a href={r.certificateUrl} target="_blank" className="text-emerald-700 underline">
                  {isRtl ? "شهادة" : "Certificate"}
                </a>
              )}
              {r.syndicateCardUrl && (
                <a href={r.syndicateCardUrl} target="_blank" className="text-emerald-700 underline">
                  {isRtl ? "كارنيه" : "Card"}
                </a>
              )}
            </div>
            {r.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => act(r.id, "APPROVE")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs"
                >
                  {isRtl ? "موافقة وتفعيل" : "Approve"}
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
