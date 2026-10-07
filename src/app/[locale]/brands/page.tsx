import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import Link from "next/link"
import { brands } from "@/components/CarBrandsSidebar"

type Props = { params: Promise<{ locale: string }> }

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-6">{isRtl ? "كل ماركات السيارات" : "All car brands"}</h1>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={`/${locale}/ads?category=cars&brand=${b.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-sm transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.logo} alt={b.name} className="h-12 object-contain" />
              <span className="text-xs text-gray-600">{b.name}</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
