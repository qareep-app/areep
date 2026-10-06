import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import ContractsList from "@/components/contracts/ContractsList"

type Props = { params: Promise<{ locale: string }> }

export default async function ContractsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar locale={locale} active="contracts" />
            <div className="flex-1 min-w-0">
              <ContractsList locale={locale} />
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
