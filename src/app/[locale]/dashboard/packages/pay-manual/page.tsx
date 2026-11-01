import { Suspense } from "react"
import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ManualPackagePay from "@/components/dashboard/ManualPackagePay"

type Props = { params: Promise<{ locale: string }> }

export default async function PayManualPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <Suspense
          fallback={
            <div className="text-center text-gray-400 text-sm py-12">...</div>
          }
        >
          <ManualPackagePay locale={locale} />
        </Suspense>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
