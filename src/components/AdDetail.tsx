"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle, MapPin, Shield } from "lucide-react"

interface AdDetailProps {
  locale: string
  adId: string
}

export default function AdDetail({ locale, adId }: AdDetailProps) {
  const isRtl = locale === "ar"
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/ads/${adId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAd(data.ad)
        else setError(data.error || "Not found")
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false))
  }, [adId])

  if (loading) {
    return <p className="text-center text-gray-500 py-12">{isRtl ? "جاري التحميل..." : "Loading..."}</p>
  }

  if (error || !ad) {
    return (
      <div className="bg-white rounded-2xl border p-10 text-center">
        <p className="text-gray-500 mb-3">{isRtl ? "الإعلان غير موجود" : "Ad not found"}</p>
        <Link href={`/${locale}/ads`} className="text-emerald-600 text-sm font-medium">
          {isRtl ? "رجوع للإعلانات" : "Back to ads"}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Images */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center text-5xl">
        {ad.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          "📦"
        )}
      </div>

      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? ad.titleAr : ad.titleEn || ad.titleAr}
        </h1>

        <p className="text-2xl font-bold text-emerald-700">
          {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {ad.city}{ad.area ? ` · ${ad.area}` : ""}
          </span>
          {ad.category && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
              {isRtl ? ad.category.nameAr : ad.category.nameEn}
            </span>
          )}
          {ad.allowEscrow && (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
              <Shield size={14} />
              {isRtl ? "وسيط قريب متاح" : "Escrow available"}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h2 className="font-semibold text-gray-900 mb-2">{isRtl ? "الوصف" : "Description"}</h2>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {isRtl ? ad.descriptionAr : ad.descriptionEn || ad.descriptionAr}
          </p>
        </div>

        <Link
          href={`/${locale}/messages`}
          className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition"
        >
          <MessageCircle size={18} />
          {isRtl ? "تواصل مع البائع (شات داخلي)" : "Contact seller (internal chat)"}
        </Link>

        <p className="text-xs text-center text-gray-400">
          {isRtl
            ? "التواصل داخل قريب فقط – مفيش أرقام تليفون بتظهر"
            : "Chat only inside Areep – no phone numbers shown"}
        </p>
      </div>
    </div>
  )
}
