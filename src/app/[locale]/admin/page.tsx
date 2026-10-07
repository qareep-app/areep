import { setRequestLocale } from "next-intl/server"
import { redirect } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminOverview from "@/components/admin/AdminOverview"
import { getSession } from "@/lib/session"

type Props = { params: Promise<{ locale: string }> }

export default async function AdminPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session) {
    redirect(`/${locale}/auth/login?next=/admin`)
  }
  if (session.role !== "ADMIN") {
    redirect(`/${locale}`)
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <AdminSidebar locale={locale} active="overview" />
            <div className="flex-1 min-w-0">
              <AdminOverview locale={locale} />
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
