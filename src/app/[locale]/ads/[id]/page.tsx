import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { MessageCircle, MapPin, Shield } from "lucide-react"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export const dynamic = "force-dynamic"

export default async function AdPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  let ad: any = null
  let errorMsg = ""

  try {
    ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, rating: true, trustBadge: true } },
      },
    })

    if (ad) {
      // views++ without blocking the page
      prisma.ad.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})
    }
  } catch (e: any) {
    console.error("Ad detail error:", e)
    errorMsg = e?.message || "Error"
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {errorMsg && (
            <div className="bg-amber-50 text-amber-800 rounded-xl p-4 text-sm mb-4 break-all">
              {errorMsg}
            </div>
          )}

          {!errorMsg && !ad && (
            <div className="bg-white rounded-2xl border p-10 text-center">
              <p className="text-gray-500 mb-3">{isRtl ? "الإعلان غير موجود" : "Ad not found"}</p>
              <Link href={`/${locale}/ads`} className="text-emerald-600 text-sm font-medium">
                {isRtl ? "رجوع للإعلانات" : "Back to ads"}
              </Link>
            </div>
          )}

          {ad && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center text-5xl">
                {Array.isArray(ad.images) && ad.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  "📦"
                )}
              </div>

              <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">{ad.titleAr}</h1>

                <p className="text-2xl font-bold text-emerald-700">
                  {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} />
                    {ad.city}
                    {ad.area ? ` · ${ad.area}` : ""}
                  </span>
                  {ad.category && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                      {isRtl ? ad.category.nameAr : ad.category.nameEn}
                    </span>
                  )}
                  {ad.allowEscrow && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                      <Shield size={14} />
                      {isRtl ? "وسيط قريب متاح" : "Escrow available"}
                    </span>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h2 className="font-semibold text-gray-900 mb-2">
                    {isRtl ? "الوصف" : "Description"}
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {ad.descriptionAr}
                  </p>
                </div>

                <Link
                  href={`/${locale}/messages`}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition"
                >
                  <MessageCircle size={18} />
                  {isRtl ? "تواصل مع البائع (شات داخلي)" : "Contact seller (internal chat)"}
                </Link>

                <p className="text-xs text-center text-gray-400">
                  {isRtl
                    ? "التواصل داخل قريب فقط – مفيش أرقام تليفون بتظهر"
                    : "Chat only inside Areep – no phone numbers shown"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
