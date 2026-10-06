import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

type Props = { params: Promise<{ locale: string }> }

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{isRtl ? "الشروط والأحكام" : "Terms of Service"}</h1>
        <div className="text-gray-600 space-y-3 leading-relaxed">
          <p>
            {isRtl
              ? "باستخدامك قريب فأنت توافق على قواعد النشر والعمولات ونظام الوسيط."
              : "By using Areep you agree to posting rules, commissions, and the escrow system."}
          </p>
          <p>
            {isRtl
              ? "العمولة الأساسية 2% مع قواعد خاصة للسيارات والعقارات عند تفعيل الوسيط."
              : "Base commission is 2%, with special rates for cars and real estate when escrow is enabled."}
          </p>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
