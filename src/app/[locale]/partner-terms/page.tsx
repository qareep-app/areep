import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

type Props = { params: Promise<{ locale: string }> }

export default async function PartnerTermsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{isRtl ? "شروط الشركاء" : "Partner Terms"}</h1>
        <p className="text-gray-600 leading-relaxed">
          {isRtl
            ? "شروط الشراكة مع قريب للتجار والمعلنين. التفاصيل الكاملة تُحدَّث مع إطلاق برنامج الشركاء."
            : "Partner terms for merchants and advertisers. Full details will be updated with the partners program launch."}
        </p>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
