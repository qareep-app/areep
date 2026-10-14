import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import EditAdForm from "@/components/EditAdForm"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditAdPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <EditAdForm locale={locale} adId={id} />
      </main>
      <Footer locale={locale} />
    </div>
  )
}
