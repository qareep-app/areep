import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import HomeFilters from "@/components/HomeFilters"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Suspense } from "react"
import { Clock, Eye } from "lucide-react"
import { timeAgo } from "@/lib/time-ago"

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

    ads = await prisma.ad.findMany({
      where: {
        status: "ACTIVE",
        ...(sp.category ? { category: { slug: sp.category } } : {}),
        ...(cityTerm
          ? { city: { contains: cityTerm, mode: "insensitive" } }
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
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy,
      take: 50,
    })
  } catch (e: any) {
    console.error("Ads page DB error:", e)
    errorMsg = e?.message || "DB error"
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <Suspense fallback={<div className="h-20 bg-white rounded-2xl animate-pulse" />}>
            <HomeFilters locale={locale} />
          </Suspense>

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isRtl ? "كل الإعلانات" : "All Ads"}
            </h1>
            <span className="text-sm text-gray-500">
              {ads.length} {isRtl ? "إعلان" : "ads"}
            </span>
          </div>

          {errorMsg && (
            <div className="bg-amber-50 text-amber-800 rounded-xl p-4 text-sm">{errorMsg}</div>
          )}

          {!errorMsg && ads.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-3">{isRtl ? "مفيش إعلانات" : "No ads"}</p>
              <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium text-sm">
                {isRtl ? "أضف إعلان" : "Post an ad"}
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {ads.map((ad) => (
              <Link
                key={ad.id}
                href={`/${locale}/ads/${ad.id}`}
                className="flex gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 hover:shadow-md transition"
              >
                <div className="w-32 h-28 sm:w-40 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {Array.isArray(ad.images) && ad.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-emerald-700 line-clamp-2">{ad.titleAr}</h3>
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                    </p>
                  </div>
                  <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      {ad.city}
                      {ad.area ? ` · ${ad.area}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(ad.createdAt, isRtl)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye size={12} />
                      {ad.views ?? 0}
                    </span>
                    {ad.user?.name && <span>{ad.user.name}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
