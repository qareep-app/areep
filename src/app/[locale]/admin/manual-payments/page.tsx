import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminManualPayments from "@/components/admin/AdminManualPayments"

type Props = { params: Promise<{ locale: string }> }

export default async function AdminManualPaymentsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header locale={locale} />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
        <AdminSidebar locale={locale} active="manual-payments" />
        <main className="flex-1 min-w-0">
          <AdminManualPayments locale={locale} />
        </main>
      </div>
    </div>
  )
}
