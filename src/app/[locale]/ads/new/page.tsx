import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AddAdForm from "@/components/AddAdForm"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function NewAdPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {locale === "ar" ? "أضف إعلان جديد" : "Post a New Ad"}
          </h1>
          <AddAdForm locale={locale} />
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
