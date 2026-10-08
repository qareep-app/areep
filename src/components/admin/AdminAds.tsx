"use client"

import { useEffect, useState } from "react"

export default function AdminAds({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ads?limit=50")
      .then((r) => r.json())
      .then((d) => setRows(d.ads || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-gray-500">...</p>

  return (
    <div className="bg-white rounded-2xl border divide-y">
      {rows.length === 0 && (
        <p className="p-6 text-center text-gray-400">{isRtl ? "لا إعلانات" : "No ads"}</p>
      )}
      {rows.map((a) => (
        <div key={a.id} className="p-4 flex justify-between gap-3 text-sm">
          <div>
            <div className="font-semibold">{a.titleAr || a.titleEn}</div>
            <div className="text-gray-500">
              {a.city} · {a.status} · {a.price} {a.currency}
            </div>
          </div>
          <div className="text-gray-400">{a.views || 0} views</div>
        </div>
      ))}
    </div>
  )
}
