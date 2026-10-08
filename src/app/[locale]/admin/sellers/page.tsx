import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminSellers from "@/components/admin/AdminSellers"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === "ar" ? "البائعين" : "Sellers"
  return (
    <AdminPageShell locale={locale} active="sellers" title={title}>
      <AdminSellers locale={locale} />
    </AdminPageShell>
  )
}
