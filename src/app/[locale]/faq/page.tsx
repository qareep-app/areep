import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

type Props = { params: Promise<{ locale: string }> }

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  const items = isRtl
    ? [
        { q: "هل أرقام التليفون تظهر؟", a: "لا. التواصل داخل الشات فقط." },
        { q: "إيه نظام وسيط قريب؟", a: "حماية فلوس الصفقة للعربيات والعقارات حتى تمام الاستلام." },
        { q: "كام العمولة؟", a: "2% عادة. السيارات والعقارات 2.5% من كل طرف مع الوسيط." },
      ]
    : [
        { q: "Are phone numbers visible?", a: "No. Chat only inside the platform." },
        { q: "What is Areep Escrow?", a: "Payment protection for cars and real estate until delivery." },
        { q: "What is the commission?", a: "2% standard. Cars/real estate 2.5% each side with escrow." },
      ]
  return (
    <div className="min-h-screen flex flex-col bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{isRtl ? "الأسئلة الشائعة" : "FAQ"}</h1>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <h2 className="font-semibold text-gray-900 mb-1">{item.q}</h2>
              <p className="text-gray-600 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
