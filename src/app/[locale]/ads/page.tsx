import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; city?: string }>
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
    // Simple query first - avoid complex filters that may fail
    ads = await prisma.ad.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 30,
    })

    // Optional filter in memory (safer on free Neon)
    if (sp.category) {
      const cat = await prisma.category.findUnique({ where: { slug: sp.category } })
      if (cat) {
        ads = ads.filter((a) => a.categoryId === cat.id)
      }
    }
    if (sp.city) {
      const city = sp.city.toLowerCase()
      ads = ads.filter((a) => (a.city || "").toLowerCase().includes(city))
    }
  } catch (e: any) {
    console.error("Ads page DB error:", e)
    errorMsg = e?.message || "DB error"
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isRtl ? "كل الإعلانات" : "All Ads"}
          </h1>

          {errorMsg && (
            <div className="bg-amber-50 text-amber-800 rounded-xl p-4 text-sm mb-4 break-all">
              {isRtl ? "تعذر تحميل الإعلانات: " : "Failed to load: "}
              {errorMsg}
            </div>
          )}

          {!errorMsg && ads.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-3">
                {isRtl ? "مفيش إعلانات لسه" : "No ads yet"}
              </p>
              <Link href={`/${locale}/ads/new`} className="text-emerald-600 font-medium text-sm">
                {isRtl ? "أضف إعلان" : "Post an ad"}
              </Link>
            </div>
          )}

          {ads.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ads.map((ad) => (
                <Link
                  key={ad.id}
                  href={`/${locale}/ads/${ad.id}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-4xl">
                    {Array.isArray(ad.images) && ad.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{ad.titleAr}</h3>
                    <p className="text-emerald-700 font-bold mt-1">
                      {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {ad.city}
                      {ad.area ? ` · ${ad.area}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
