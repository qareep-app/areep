import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HomeHero from "@/components/HomeHero"
import CategoryGrid from "@/components/CategoryGrid"
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
      take: 8,
    })
  } catch (e) {
    console.error("Home ads error:", e)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <HomeHero locale={locale} />
        <CategoryGrid locale={locale} />

        {/* Latest ads - server rendered */}
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

            {ads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-gray-500 mb-3">{isRtl ? "مفيش إعلانات لسه" : "No ads yet"}</p>
                <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium text-sm">
                  {isRtl ? "أضف أول إعلان" : "Post the first ad"}
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ads.map((ad) => (
                  <Link
                    key={ad.id}
                    href={`/${locale}/ads/${ad.id}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
                  >
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-3xl">
                      {Array.isArray(ad.images) && ad.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{ad.titleAr}</h3>
                      <p className="text-emerald-700 font-bold text-sm mt-1">
                        {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ad.city}
                        {ad.area ? ` · ${ad.area}` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <Features locale={locale} />
        <CTASection locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  )
}
