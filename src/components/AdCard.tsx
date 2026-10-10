"use client"

import Link from "next/link"
import { MapPin, Clock, User, Shield } from "lucide-react"

function timeAgo(dateStr: string | undefined, isRtl: boolean) {
  if (!dateStr) return ""
  const d = new Date(dateStr).getTime()
  if (Number.isNaN(d)) return ""
  const sec = Math.max(1, Math.floor((Date.now() - d) / 1000))
  if (sec < 60) return isRtl ? "الآن" : "now"
  const min = Math.floor(sec / 60)
  if (min < 60) return isRtl ? `منذ ${min} د` : `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return isRtl ? `منذ ${hr} س` : `${hr}h ago`
  const day = Math.floor(hr / 24)
  return isRtl ? `منذ ${day} ي` : `${day}d ago`
}

export type AdCardAd = {
  id: string
  titleAr?: string
  titleEn?: string | null
  price?: number | string
  currency?: string
  city?: string | null
  area?: string | null
  images?: string[]
  condition?: string | null
  allowEscrow?: boolean
  views?: number
  createdAt?: string
  attributes?: any
  category?: { nameAr?: string; nameEn?: string; slug?: string } | null
  user?: { name?: string | null; phone?: string | null } | null
}

export default function AdCard({
  ad,
  locale,
  layout = "grid",
}: {
  ad: AdCardAd
  locale: string
  layout?: "grid" | "list"
}) {
  const isRtl = locale === "ar"
  const title = isRtl ? ad.titleAr : ad.titleEn || ad.titleAr
  const img = Array.isArray(ad.images) && ad.images[0] ? ad.images[0] : null
  const imgCount = Array.isArray(ad.images) ? ad.images.length : 0
  const price = Number(ad.price || 0)
  const attrs = ad.attributes || {}
  const specs: string[] = []
  if (ad.condition === "NEW" || attrs.condition === "NEW") specs.push(isRtl ? "جديد" : "New")
  else if (ad.condition === "USED" || attrs.condition === "USED") specs.push(isRtl ? "مستعمل" : "Used")
  if (attrs.year) specs.push(String(attrs.year))
  if (attrs.mileage) specs.push(`${attrs.mileage} ${isRtl ? "كم" : "km"}`)
  if (attrs.transmission === "auto") specs.push(isRtl ? "أوتوماتيك" : "Auto")
  if (attrs.transmission === "manual") specs.push(isRtl ? "مانيوال" : "Manual")
  if (attrs.fuel) specs.push(String(attrs.fuel))
  if (attrs.importType === "imported") specs.push(isRtl ? "مستورد" : "Imported")
  if (attrs.importType === "transfer") specs.push(isRtl ? "تنازل" : "Transfer")

  const seller = ad.user?.name || (isRtl ? "بائع" : "Seller")
  const location = [ad.city, ad.area].filter(Boolean).join(" · ")

  if (layout === "list") {
    return (
      <Link
        href={`/${locale}/ads/${ad.id}`}
        className="flex gap-3 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition p-3"
      >
        <div className="relative w-28 sm:w-36 h-24 sm:h-28 rounded-xl bg-gray-100 overflow-hidden shrink-0">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
          )}
          {imgCount > 1 && (
            <span className="absolute bottom-1 start-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
              1/{imgCount}
            </span>
          )}
          {ad.allowEscrow && (
            <span className="absolute top-1 end-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Shield size={10} />
              {isRtl ? "وسيط" : "Escrow"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{title}</h3>
            {specs.length > 0 && (
              <p className="text-xs text-gray-500 mt-1 truncate">{specs.join(" · ")}</p>
            )}
          </div>
          <div>
            <p className="text-emerald-700 font-bold text-base sm:text-lg">
              {price.toLocaleString()} {isRtl ? "جنيه" : "EGP"}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 mt-1">
              {location && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin size={12} /> {location}
                </span>
              )}
              <span className="inline-flex items-center gap-0.5">
                <User size={12} /> {seller}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Clock size={12} /> {timeAgo(ad.createdAt, isRtl)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/${locale}/ads/${ad.id}`}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {imgCount > 1 && (
          <span className="absolute bottom-2 start-2 text-[11px] bg-black/55 text-white px-2 py-0.5 rounded-md">
            1 / {imgCount}
          </span>
        )}
        {ad.allowEscrow && (
          <span className="absolute top-2 end-2 bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
            <Shield size={12} />
            {isRtl ? "وسيط قريب" : "Escrow"}
          </span>
        )}
      </div>
      <div className="p-3.5 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">{title}</h3>
        {specs.length > 0 && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{specs.join(" · ")}</p>
        )}
        <p className="text-emerald-700 font-bold text-lg mt-2">
          {price.toLocaleString()}{" "}
          <span className="text-sm font-semibold">{isRtl ? "جنيه" : "EGP"}</span>
        </p>
        <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 border-t border-gray-50 mt-3">
          {location && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin size={12} /> {location}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5">
            <User size={12} /> {seller}
          </span>
          <span className="inline-flex items-center gap-0.5 ms-auto">
            <Clock size={12} /> {timeAgo(ad.createdAt, isRtl)}
          </span>
        </div>
      </div>
    </Link>
  )
}
