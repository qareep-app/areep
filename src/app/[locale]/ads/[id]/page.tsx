import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { timeAgo } from "@/lib/time-ago"
import { Clock, Eye, MapPin, Shield } from "lucide-react"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export const dynamic = "force-dynamic"

export default async function AdDetailPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  let ad: any = null
  let similar: any[] = []

  try {
    ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, rating: true } },
        category: true,
      },
    })
    if (ad) {
      // increment views (best effort)
      try {
        await prisma.ad.update({
          where: { id },
          data: { views: { increment: 1 } },
        })
      } catch {}

      similar = await prisma.ad.findMany({
        where: {
          status: "ACTIVE",
          id: { not: id },
          OR: [
            ad.city ? { city: { contains: ad.city, mode: "insensitive" } } : undefined,
            ad.categoryId ? { categoryId: ad.categoryId } : undefined,
          ].filter(Boolean) as any,
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      })
    }
  } catch (e) {
    console.error(e)
  }

  if (!ad) notFound()

  const images: string[] = Array.isArray(ad.images) ? ad.images : []

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="text-sm text-gray-500 mb-4">
          <Link href={`/${locale}`} className="hover:text-emerald-600">
            {isRtl ? "الرئيسية" : "Home"}
          </Link>
          {" / "}
          <Link href={`/${locale}/ads`} className="hover:text-emerald-600">
            {isRtl ? "الإعلانات" : "Ads"}
          </Link>
          {" / "}
          <span className="text-gray-800">{ad.titleAr}</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Main ad */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Gallery */}
            <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt="" className="w-full h-full object-contain bg-white" />
              ) : (
                <span className="text-5xl">📦</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-20 h-16 object-cover rounded-lg border border-gray-100"
                  />
                ))}
              </div>
            )}

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-emerald-700">
                    {ad.titleAr}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} />
                      {ad.city}
                      {ad.area ? ` · ${ad.area}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} />
                      {timeAgo(ad.createdAt, isRtl)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye size={14} />
                      {ad.views ?? 0}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                </p>
              </div>

              {ad.user?.name && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    {ad.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{ad.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {isRtl ? "حساب البائع" : "Seller account"}
                    </p>
                  </div>
                </div>
              )}

              {ad.allowEscrow && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Shield size={16} />
                    <span>
                      {isRtl
                        ? "هذا الإعلان يدعم وسيط قريب (حجز المبلغ حتى التسليم)"
                        : "This ad supports Areep Escrow (funds held until delivery)"}
                    </span>
                  </div>
                  <Link href={`/${locale}/escrow`} className="text-emerald-700 font-semibold underline shrink-0">
                    {isRtl ? "كيف يعمل؟" : "How it works"}
                  </Link>
                </div>
              )}

              <div>
                <h2 className="font-semibold text-gray-900 mb-2">
                  {isRtl ? "الوصف" : "Description"}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {ad.descriptionAr || (isRtl ? "لا يوجد وصف" : "No description")}
                </p>
              </div>

              {ad.category && (
                <p className="text-sm text-gray-500">
                  {isRtl ? "الفئة: " : "Category: "}
                  <Link
                    href={`/${locale}/ads?category=${ad.category.slug}`}
                    className="text-emerald-600"
                  >
                    {isRtl ? ad.category.nameAr : ad.category.nameEn}
                  </Link>
                </p>
              )}

              <Link
                href={`/${locale}/chat?ad=${ad.id}`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                {isRtl ? "راسل البائع (شات الموقع)" : "Message seller"}
              </Link>
            </div>
          </div>

          {/* Similar ads sidebar */}
          <aside>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-36">
              <h3 className="font-bold text-gray-800 mb-3">
                {isRtl ? "عروض مشابهة" : "Similar ads"}
              </h3>
              {similar.length === 0 ? (
                <p className="text-sm text-gray-400">
                  {isRtl ? "مفيش عروض مشابهة حالياً" : "No similar ads"}
                </p>
              ) : (
                <div className="space-y-3">
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${locale}/ads/${s.id}`}
                      className="flex gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition"
                    >
                      <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {Array.isArray(s.images) && s.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-emerald-700 line-clamp-2">
                          {s.titleAr}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {s.city}
                        </p>
                        <p className="text-xs font-bold text-blue-600">
                          {Number(s.price).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
