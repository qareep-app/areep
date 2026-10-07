import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {isRtl ? "عن قريب" : "About Areep"}
          </h1>
          <div className="prose prose-gray text-gray-600 leading-relaxed space-y-4">
            {isRtl ? (
              <><p>قريب أول وأكبر منصة إعلانات مبوبة مصرية بتساعدك تبيع وتشتري من الناس اللي حواليك بسهولة وأمان.</p><p>هدفنا نخلي الدكان قريب منك، من غير توصيل غالي ولا مشاوير بعيدة.</p></>
            ) : (
              <><p>Areep Egypt's first and largest classified ads platform. that helps you buy and sell from people nearby easily and safely.</p><p>Our goal is to bring the shop close to you, without expensive delivery or long trips.</p></>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
