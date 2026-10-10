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
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import AdCard from "@/components/AdCard"
import { Sparkles } from "lucide-react"

type Props = {
  params: Promise<{ locale: string }>
}

export const dynamic = "force-dynamic"

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  let featured: any[] = []
  let ads: any[] = []
  try {
    const include = {
      user: { select: { id: true, name: true, phone: true } },
      category: true,
    }
    featured = await (prisma as any).ad.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      orderBy: [{ featuredUntil: "desc" }, { createdAt: "desc" }],
      take: 8,
      include,
    })
    ads = await (prisma as any).ad.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 24,
      include,
    })
  } catch (e) {
    console.error("Home ads error:", e)
  }

  const featuredIds = new Set(featured.map((a) => a.id))
  const rest = ads.filter((a) => !featuredIds.has(a.id))

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />

      <main className="flex-1">
        <HomeHero locale={locale} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Suspense fallback={null}>
            <HomeFilters locale={locale} />
          </Suspense>

          <div className="grid lg:grid-cols-[300px_1fr] gap-6 mt-4">
            <div className="order-1">
              <CarBrandsSidebar locale={locale} limit={9} />
            </div>

            <div className="order-2 min-w-0 space-y-8">
              {featured.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={18} />
                      {isRtl ? "إعلانات مميزة" : "Featured"}
                    </h2>
                    <Link href={`/${locale}/ads`} className="text-sm text-emerald-600 font-medium">
                      {isRtl ? "المزيد" : "More"}
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {featured.map((ad) => (
                      <AdCard key={ad.id} ad={ad} locale={locale} layout="grid" />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {isRtl ? "أحدث الإعلانات" : "Latest Ads"}
                  </h2>
                  <Link href={`/${locale}/ads`} className="text-sm text-emerald-600 font-medium">
                    {isRtl ? "عرض الكل" : "View all"}
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {(rest.length ? rest : ads).map((ad) => (
                    <AdCard key={ad.id} ad={ad} locale={locale} layout="list" />
                  ))}
                </div>
                {ads.length === 0 && (
                  <div className="bg-gray-50 rounded-2xl border p-10 text-center text-gray-500 text-sm">
                    {isRtl ? "مفيش إعلانات لسه" : "No ads yet"}
                  </div>
                )}
              </section>
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
