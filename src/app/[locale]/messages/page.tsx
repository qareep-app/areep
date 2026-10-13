import { Suspense } from "react"
import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import MessagesClient from "./MessagesClient"

type Props = { params: Promise<{ locale: string }> }

export const dynamic = "force-dynamic"

export default async function MessagesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">
          {isRtl ? "الرسائل" : "Messages"}
        </h1>
        <Suspense
          fallback={
            <div className="p-8 text-center text-gray-400 text-sm">
              {isRtl ? "جاري التحميل..." : "Loading..."}
            </div>
          }
        >
          <MessagesClient />
        </Suspense>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
