import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import ContractDetail from "@/components/contracts/ContractDetail"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function ContractDetailPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar locale={locale} active="contracts" />
            <div className="flex-1 min-w-0">
              <ContractDetail locale={locale} contractId={id} />
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
