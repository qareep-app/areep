import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

type Props = { params: Promise<{ locale: string }> }

export default async function MessagesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{isRtl ? "الرسائل" : "Messages"}</h1>
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 mb-2">
              {isRtl ? "مفيش محادثات حالياً" : "No conversations yet"}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {isRtl
                ? "لما تتواصل مع بائع من صفحة الإعلان، المحادثة هتظهر هنا. التواصل داخل قريب فقط."
                : "When you contact a seller from an ad page, the chat will appear here."}
            </p>
            <Link href={`/${locale}/ads`} className="text-emerald-600 font-medium text-sm">
              {isRtl ? "تصفح الإعلانات" : "Browse ads"}
            </Link>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
