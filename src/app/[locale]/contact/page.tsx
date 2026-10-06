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
            {isRtl ? "تواصل معنا" : "Contact us"}
          </h1>
          <div className="prose prose-gray text-gray-600 leading-relaxed space-y-4">
            {isRtl ? (
              <><p>للاستفسارات والدعم:</p><p>البريد: support@areep.eg</p><p>أو من خلال نموذج الرسائل داخل حسابك.</p></>
            ) : (
              <><p>For inquiries and support:</p><p>Email: support@areep.eg</p><p>Or through messages inside your account.</p></>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
