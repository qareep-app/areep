import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import HomeFilters from "@/components/HomeFilters"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import AdCard from "@/components/AdCard"
import { Suspense } from "react"
import { Sparkles } from "lucide-react"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export const dynamic = "force-dynamic"

export default async function AdsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  let featured: any[] = []
  let ads: any[] = []
  let errorMsg = ""

  try {
    const priceFilter: any = {}
    if (sp.min && !Number.isNaN(Number(sp.min))) priceFilter.gte = Number(sp.min)
    if (sp.max && !Number.isNaN(Number(sp.max))) priceFilter.lte = Number(sp.max)

    let orderBy: any = [{ createdAt: "desc" }]
    if (sp.sort === "price_asc") orderBy = [{ price: "asc" }]
    if (sp.sort === "price_desc") orderBy = [{ price: "desc" }]

    const cityTerm = sp.city || sp.gov || ""

    const baseWhere: any = {
      status: "ACTIVE",
      ...(sp.category ? { category: { slug: sp.category } } : {}),
      ...(sp.condition ? { condition: sp.condition } : {}),
      ...(cityTerm
        ? {
            OR: [
              { city: { contains: cityTerm, mode: "insensitive" } },
              { area: { contains: cityTerm, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(sp.q
        ? {
            OR: [
              { titleAr: { contains: sp.q, mode: "insensitive" } },
              { descriptionAr: { contains: sp.q, mode: "insensitive" } },
              { city: { contains: sp.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(sp.brand
        ? {
            OR: [
              { titleAr: { contains: sp.brand, mode: "insensitive" } },
              { descriptionAr: { contains: sp.brand, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    // importType stored in attributes JSON — filter in JS if needed
    const include = {
      user: { select: { name: true, phone: true } },
      category: true,
    }

    featured = await (prisma as any).ad.findMany({
      where: {
        ...baseWhere,
        isFeatured: true,
      },
      include,
      orderBy: [{ featuredUntil: "desc" }, { createdAt: "desc" }],
      take: 12,
    })

    ads = await (prisma as any).ad.findMany({
      where: baseWhere,
      include,
      orderBy,
      take: 60,
    })

    // client-side importType filter (attributes JSON)
    if (sp.importType) {
      const match = (a: any) => a?.attributes?.importType === sp.importType
      featured = featured.filter(match)
      ads = ads.filter(match)
    }
  } catch (e: any) {
    console.error("Ads page DB error:", e)
    errorMsg = e?.message || "DB error"
  }

  // non-featured list for "all ads" (still show all in list, featured highlighted above)
  const featuredIds = new Set(featured.map((a) => a.id))
  const restAds = ads.filter((a) => !featuredIds.has(a.id))

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-5 space-y-6">
          {/* Filters full width - visible */}
          <Suspense fallback={<div className="h-24 bg-white rounded-2xl border animate-pulse" />}>
            <HomeFilters locale={locale} variant="bar" />
          </Suspense>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {errorMsg}
            </p>
          )}

          {/* Featured / premium */}
          {featured.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                <h2 className="text-lg font-bold text-gray-900">
                  {isRtl ? "إعلانات مميزة" : "Featured ads"}
                </h2>
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  {isRtl ? "باقات مميزة" : "Premium"}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featured.map((ad) => (
                  <div key={ad.id} className="relative">
                    <div className="absolute -top-2 start-3 z-10 text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow">
                      {isRtl ? "مميز" : "Featured"}
                    </div>
                    <AdCard ad={ad} locale={locale} layout="grid" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All ads - list layout */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-lg font-bold text-gray-900">
                {isRtl ? "كل الإعلانات" : "All ads"}
                <span className="text-sm font-normal text-gray-500 ms-2">
                  ({ads.length})
                </span>
              </h1>
              {sp.category && (
                <span className="text-xs text-gray-500 bg-white border rounded-full px-3 py-1">
                  {sp.category}
                </span>
              )}
            </div>

            {ads.length === 0 && !errorMsg && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-gray-500 mb-3">{isRtl ? "مفيش إعلانات" : "No ads"}</p>
                <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium text-sm">
                  {isRtl ? "أضف إعلان" : "Post an ad"}
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* show featured first in list too then rest */}
              {[...featured, ...restAds].map((ad) => (
                <AdCard key={`all-${ad.id}`} ad={ad} locale={locale} layout="list" />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
