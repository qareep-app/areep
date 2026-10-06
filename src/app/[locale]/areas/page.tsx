import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

type Props = { params: Promise<{ locale: string }> }

const cities = [
  { ar: "القاهرة", en: "Cairo" },
  { ar: "الجيزة", en: "Giza" },
  { ar: "الإسكندرية", en: "Alexandria" },
  { ar: "الشرقية", en: "Sharqia" },
  { ar: "القليوبية", en: "Qalyubia" },
  { ar: "الدقهلية", en: "Dakahlia" },
  { ar: "البحيرة", en: "Beheira" },
  { ar: "المنوفية", en: "Menoufia" },
  { ar: "الغربية", en: "Gharbia" },
  { ar: "كفر الشيخ", en: "Kafr El Sheikh" },
  { ar: "دمياط", en: "Damietta" },
  { ar: "بورسعيد", en: "Port Said" },
  { ar: "الإسماعيلية", en: "Ismailia" },
  { ar: "السويس", en: "Suez" },
  { ar: "أسيوط", en: "Assiut" },
  { ar: "سوهاج", en: "Sohag" },
  { ar: "قنا", en: "Qena" },
  { ar: "الأقصر", en: "Luxor" },
  { ar: "أسوان", en: "Aswan" },
  { ar: "البحر الأحمر", en: "Red Sea" },
]

export default async function AreasPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isRtl ? "الأحياء والمحافظات" : "Areas & Governorates"}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cities.map((c) => (
              <Link
                key={c.en}
                href={`/${locale}/ads?city=${encodeURIComponent(isRtl ? c.ar : c.en)}`}
                className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 text-sm font-medium text-gray-700 transition text-center"
              >
                {isRtl ? c.ar : c.en}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
