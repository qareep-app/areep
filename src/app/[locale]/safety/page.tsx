import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

type Props = { params: Promise<{ locale: string }> }

export default async function SafetyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isRtl ? "دليل الأمان" : "Safety Guide"}
          </h1>
          <div className="text-gray-600 space-y-4 leading-relaxed">
            {isRtl ? (
              <>
                <p>قريب بتوفر بيئة آمنة للبيع والشراء. اتبع النصايح دي:</p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>التواصل داخل الموقع فقط — مفيش أرقام تليفون بتظهر.</li>
                  <li>للسلع الغالية (عربيات وعقارات) استخدم نظام وسيط قريب.</li>
                  <li>اتقابل في مكان عام وآمن لما يكون الاستلام يدوي.</li>
                  <li>متحوّلش فلوس مقدماً من غير ضمان الوسيط.</li>
                  <li>بلّغ عن أي إعلان مشبوه من خلال تواصل معنا.</li>
                </ul>
              </>
            ) : (
              <>
                <p>Areep provides a safer marketplace. Follow these tips:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Chat only inside the platform — no phone numbers shown.</li>
                  <li>For cars and real estate use Areep Escrow.</li>
                  <li>Meet in a public safe place for handovers.</li>
                  <li>Do not pay in advance without escrow protection.</li>
                  <li>Report suspicious ads via Contact us.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
