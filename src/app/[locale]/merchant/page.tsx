import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

type Props = { params: Promise<{ locale: string }> }

export default async function MerchantPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">{isRtl ? "تاجر قريب" : "Areep Merchant"}</h1>
        <p className="text-gray-600 mb-6">
          {isRtl
            ? "باقات مميزة للتجار قريباً. يمكنك البدء بنشر إعلاناتك الآن."
            : "Merchant packages coming soon. You can start posting ads now."}
        </p>
        <Link href={`/${locale}/dashboard/packages`} className="text-emerald-600 font-medium">
          {isRtl ? "عرض الباقات" : "View packages"}
        </Link>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
