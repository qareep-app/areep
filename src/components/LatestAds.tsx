"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AdCard from "@/components/AdCard"

interface LatestAdsProps {
  locale: string
}

export default function LatestAds({ locale }: LatestAdsProps) {
  const isRtl = locale === "ar"
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ads?limit=8")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAds(data.ads || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-10 md:py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isRtl ? "أحدث الإعلانات" : "Latest Ads"}
          </h2>
          <Link href={`/${locale}/ads`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            {isRtl ? "عرض الكل ←" : "View all →"}
          </Link>
        </div>

        {loading && (
          <p className="text-center text-gray-500 text-sm py-8">
            {isRtl ? "جاري التحميل..." : "Loading..."}
          </p>
        )}

        {!loading && ads.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-500 mb-3">{isRtl ? "مفيش إعلانات لسه" : "No ads yet"}</p>
            <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium text-sm">
              {isRtl ? "أضف أول إعلان" : "Post the first ad"}
            </Link>
          </div>
        )}

        {!loading && ads.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} locale={locale} layout="grid" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
