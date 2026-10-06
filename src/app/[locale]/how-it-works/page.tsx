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
            {isRtl ? "كيف يعمل؟" : "How it works?"}
          </h1>
          <div className="prose prose-gray text-gray-600 leading-relaxed space-y-4">
            {isRtl ? (
              <><p><strong>1.</strong> سجّل برقم موبايلك.</p><p><strong>2.</strong> انشر إعلانك أو دور على اللي محتاجه.</p><p><strong>3.</strong> تواصل من خلال الشات الداخلي فقط.</p><p><strong>4.</strong> للسلع الغالية استخدم نظام وسيط قريب لحماية الفلوس.</p></>
            ) : (
              <><p><strong>1.</strong> Sign up with your phone number.</p><p><strong>2.</strong> Post an ad or search for what you need.</p><p><strong>3.</strong> Chat only inside the platform.</p><p><strong>4.</strong> For high-value items use Areep Escrow to protect your money.</p></>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
