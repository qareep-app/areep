"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface AdsListProps {
  locale: string
  category?: string
  city?: string
}

export default function AdsList({ locale, category, city }: AdsListProps) {
  const isRtl = locale === "ar"
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (city) params.set("city", city)
    params.set("limit", "30")

    fetch(`/api/ads?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAds(data.ads || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, city])

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        {isRtl ? "جاري التحميل..." : "Loading..."}
      </div>
    )
  }

  if (ads.length === 0) {
    return (
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
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ads.map((ad) => (
        <Link
          key={ad.id}
          href={`/${locale}/ads/${ad.id}`}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
        >
          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-4xl">
            {ad.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              "📦"
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 truncate">
              {isRtl ? ad.titleAr : ad.titleEn || ad.titleAr}
            </h3>
            <p className="text-emerald-700 font-bold mt-1">
              {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {ad.city}
              {ad.area ? ` · ${ad.area}` : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
