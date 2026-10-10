"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import AdCard from "@/components/AdCard"
import { LayoutGrid, List } from "lucide-react"

interface AdsListProps {
  locale: string
  category?: string
  city?: string
}

export default function AdsList({ locale, category, city }: AdsListProps) {
  const isRtl = locale === "ar"
  const sp = useSearchParams()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [condition, setCondition] = useState(sp?.get("condition") || "")
  const [q, setQ] = useState(sp?.get("q") || "")

  useEffect(() => {
    const params = new URLSearchParams()
    const cat = category || sp?.get("category") || ""
    const cty = city || sp?.get("city") || ""
    const query = q || sp?.get("q") || ""
    if (cat) params.set("category", cat)
    if (cty) params.set("city", cty)
    if (query) params.set("q", query)
    if (condition) params.set("condition", condition)
    params.set("limit", "40")

    setLoading(true)
    fetch(`/api/ads?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAds(data.ads || [])
        else setAds([])
      })
      .catch(() => setAds([]))
      .finally(() => setLoading(false))
  }, [category, city, condition, q, sp])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { v: "", ar: "الكل", en: "All" },
            { v: "USED", ar: "مستعمل", en: "Used" },
            { v: "NEW", ar: "جديد", en: "New" },
          ].map((f) => (
            <button
              key={f.v || "all"}
              type="button"
              onClick={() => setCondition(f.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                condition === f.v
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 hover:border-emerald-300"
              }`}
            >
              {isRtl ? f.ar : f.en}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-white">
          <button
            type="button"
            onClick={() => setLayout("grid")}
            className={`p-1.5 rounded ${layout === "grid" ? "bg-emerald-50 text-emerald-700" : "text-gray-400"}`}
            aria-label="grid"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setLayout("list")}
            className={`p-1.5 rounded ${layout === "list" ? "bg-emerald-50 text-emerald-700" : "text-gray-400"}`}
            aria-label="list"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-500 text-sm">
          {isRtl ? "جاري التحميل..." : "Loading..."}
        </div>
      )}

      {!loading && ads.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">
            {isRtl ? "مفيش إعلانات لسه. كن أول من يضيف!" : "No ads yet. Be the first to post!"}
          </p>
          <Link
            href={`/${locale}/ads/new`}
            className="inline-block mt-4 text-emerald-600 font-medium text-sm hover:underline"
          >
            {isRtl ? "أضف إعلان" : "Post an ad"}
          </Link>
        </div>
      )}

      {!loading && ads.length > 0 && (
        <div
          className={
            layout === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} locale={locale} layout={layout} />
          ))}
        </div>
      )}
    </div>
  )
}
