"use client"

import Link from "next/link"
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

type Ad = {
  id: string
  titleAr?: string
  titleEn?: string
  price?: number | string
  currency?: string
  city?: string
  images?: string[]
  isFeatured?: boolean
}

export default function FeaturedPromoStrip({
  locale,
  ads,
}: {
  locale: string
  ads: Ad[]
}) {
  const isRtl = locale === "ar"
  if (!ads?.length) return null

  return (
    <section className="border-b border-amber-100 bg-gradient-to-b from-amber-50/90 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm sm:text-base font-bold text-amber-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" />
            {isRtl ? "إعلانات مميزة ومدفوعة" : "Featured & promoted"}
          </h2>
          <Link
            href={`/${locale}/ads?featured=1`}
            className="text-xs sm:text-sm text-emerald-700 font-medium hover:underline"
          >
            {isRtl ? "عرض الكل" : "View all"}
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {ads.map((ad) => {
            const img = Array.isArray(ad.images) ? ad.images[0] : null
            const title = isRtl ? ad.titleAr : ad.titleEn || ad.titleAr
            return (
              <Link
                key={ad.id}
                href={`/${locale}/ads/${ad.id}`}
                className="snap-start shrink-0 w-[150px] sm:w-[170px] rounded-xl border border-amber-200/80 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gray-100 relative">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                  <span className="absolute top-1.5 start-1.5 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-md">
                    {isRtl ? "مميز" : "Featured"}
                  </span>
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-2 min-h-[2rem]">{title}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-1">
                    {Number(ad.price || 0).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                  </p>
                  {ad.city && <p className="text-[10px] text-gray-400 truncate">{ad.city}</p>}
                </div>
              </Link>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          {isRtl ? (
            <>
              <ChevronLeft size={12} /> اسحب لعرض المزيد
            </>
          ) : (
            <>
              Swipe for more <ChevronRight size={12} />
            </>
          )}
        </p>
      </div>
    </section>
  )
}
