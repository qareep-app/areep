import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import HomeFilters from "@/components/HomeFilters"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import AdCard from "@/components/AdCard"

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

    ads = await (prisma as any).ad.findMany({
      where: {
        status: "ACTIVE",
        ...(sp.category ? { category: { slug: sp.category } } : {}),
        ...(sp.condition ? { condition: sp.condition } : {}),
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
        user: { select: { name: true, phone: true } },
        category: true,
      },
      orderBy,
      take: 50,
    })
  } catch (e: any) {
    console.error("Ads page DB error:", e)
    errorMsg = e?.message || "DB error"
  }

  const qs = (cond: string) => {
    const p = new URLSearchParams()
    Object.entries(sp).forEach(([k, v]) => {
      if (v && k !== "condition") p.set(k, v)
    })
    if (cond) p.set("condition", cond)
    const s = p.toString()
    return s ? `?${s}` : ""
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-64 shrink-0">
              <HomeFilters locale={locale} />
            </aside>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {isRtl ? "كل الإعلانات" : "All ads"}
                  <span className="text-sm font-normal text-gray-500 ms-2">({ads.length})</span>
                </h1>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "", ar: "الكل", en: "All" },
                    { v: "USED", ar: "مستعمل", en: "Used" },
                    { v: "NEW", ar: "جديد", en: "New" },
                  ].map((f) => {
                    const active = (sp.condition || "") === f.v
                    return (
                      <Link
                        key={f.v || "all"}
                        href={`/${locale}/ads${qs(f.v)}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-600 hover:border-emerald-300"
                        }`}
                      >
                        {isRtl ? f.ar : f.en}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {errorMsg}
                </p>
              )}

              {!errorMsg && ads.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <p className="text-gray-500 mb-3">{isRtl ? "مفيش إعلانات" : "No ads"}</p>
                  <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium text-sm">
                    {isRtl ? "أضف إعلان" : "Post an ad"}
                  </Link>
                </div>
              )}

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} locale={locale} layout="grid" />
                ))}
              </div>

              {/* list style section for cars-like horizontal cards */}
              {ads.length > 0 && (
                <div className="pt-4">
                  <h2 className="text-sm font-semibold text-gray-600 mb-3">
                    {isRtl ? "عرض قائمة" : "List view"}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {ads.slice(0, 12).map((ad) => (
                      <AdCard key={`l-${ad.id}`} ad={ad} locale={locale} layout="list" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
