"use client"

import Link from "next/link"
import { MapPin, Search } from "lucide-react"

interface HomeHeroProps {
  locale?: string
}

export default function HomeHero({ locale = "ar" }: HomeHeroProps) {
  const isRtl = locale === "ar"

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="text-center md:text-start order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.2] mb-4">
              {isRtl ? (
                <>
                  بتدور على ايه؟
                  <br />
                  <span className="text-emerald-600">دكانك قريب</span>{" "}
                  <span className="text-orange-500">منك</span>
                </>
              ) : (
                <>
                  What are you looking for?
                  <br />
                  <span className="text-emerald-600">Your shop is</span>{" "}
                  <span className="text-orange-500">near you</span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-7 max-w-md mx-auto md:mx-0 leading-relaxed">
              {isRtl
                ? "بيع واشتري من الناس اللي حواليك - من غير توصيل غالي ولا مشاوير بعيدة"
                : "Buy and sell from people around you – no expensive delivery or long trips"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href={`/${locale}/nearby`}
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-full shadow-md shadow-orange-200/50 transition text-sm sm:text-base"
              >
                <MapPin size={18} />
                {isRtl ? "وريني اللي قريب مني" : "Show me nearby"}
              </Link>
              <Link
                href={`/${locale}/ads`}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-5 py-3 rounded-full border border-gray-200 transition text-sm sm:text-base"
              >
                <Search size={16} />
                {isRtl ? "تصفح كل الإعلانات" : "Browse all ads"}
              </Link>
            </div>
          </div>

          <div className="relative order-1 md:order-2">
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white bg-emerald-50">
              {/* plain img avoids next/image hydration mismatch */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-street.jpg"
                alt={isRtl ? "دكانك قريب" : "Your shop is near"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
