import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

type Props = { params: Promise<{ locale: string }> }

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{isRtl ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        <div className="text-gray-600 space-y-3 leading-relaxed">
          <p>
            {isRtl
              ? "نحترم خصوصيتك. أرقام الهواتف لا تظهر للمستخدمين الآخرين. التواصل يتم داخل المنصة فقط."
              : "We respect your privacy. Phone numbers are never shown to other users. Communication happens only inside the platform."}
          </p>
          <p>
            {isRtl
              ? "نستخدم بياناتك لتشغيل الحساب والإعلانات وتحسين الخدمة فقط."
              : "We use your data only to operate accounts, ads, and improve the service."}
          </p>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
