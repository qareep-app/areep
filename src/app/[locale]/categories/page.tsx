import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryGrid from "@/components/CategoryGrid"

type Props = { params: Promise<{ locale: string }> }

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <div className="min-h-screen flex flex-col bg-white" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <CategoryGrid locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  )
}
