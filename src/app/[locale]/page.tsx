import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HomeHero from "@/components/HomeHero"
import CategoryBar from "@/components/CategoryBar"
import HomeFilters from "@/components/HomeFilters"
import CarBrandsSidebar from "@/components/CarBrandsSidebar"
import Features from "@/components/Features"
import CTASection from "@/components/CTASection"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ locale: string }>
}

export const dynamic = "force-dynamic"

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  let ads: any[] = []
  try {
    ads = await prisma.ad.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 30,
    })
  } catch (e) {
    console.error("Home ads error:", e)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />

      <main className="flex-1">
        <HomeHero locale={locale} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <HomeFilters locale={locale} />

          {/* 
            RTL: first column in DOM appears on the RIGHT → brands sidebar
            second column → ads list on the LEFT
          */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-6 mt-2">
            {/* Brands — right side in Arabic */}
            <div className="order-1">
              <CarBrandsSidebar locale={locale} limit={9} />
            </div>

            {/* Ads feed — left side in Arabic */}
            <div className="order-2 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {isRtl ? "أحدث الإعلانات" : "Latest Ads"}
                </h2>
                <Link href={`/${locale}/ads`} className="text-sm text-emerald-600 font-medium">
                  {isRtl ? "عرض الكل" : "View all"}
                </Link>
              </div>

              {ads.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-10 text-center">
                  <p className="text-gray-500 mb-3">
                    {isRtl ? "مفيش إعلانات لسه" : "No ads yet"}
                  </p>
                  <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium text-sm">
                    {isRtl ? "أضف أول إعلان" : "Post the first ad"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {ads.map((ad) => (
                    <Link
                      key={ad.id}
                      href={`/${locale}/ads/${ad.id}`}
                      className="flex gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md hover:border-emerald-200 transition"
                    >
                      {/* Image */}
                      <div className="w-28 h-24 sm:w-36 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {Array.isArray(ad.images) && ad.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ad.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                            {ad.titleAr}
                          </h3>
                          {ad.descriptionAr && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {ad.descriptionAr}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-emerald-700 font-bold text-sm">
                            {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                          </span>
                          <span className="text-xs text-gray-400 truncate">
                            {ad.city}
                            {ad.area ? ` · ${ad.area}` : ""}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Features locale={locale} />
        <CTASection locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  )
}
