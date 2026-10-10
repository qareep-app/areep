import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminCategoriesPanel from "@/components/admin/AdminCategoriesPanel"

type Props = { params: Promise<{ locale: string }> }

export default async function AdminCategoriesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <AdminPageShell locale={locale} title={locale === "ar" ? "إدارة التصنيفات" : "Categories"}>
      <AdminCategoriesPanel locale={locale} />
    </AdminPageShell>
  )
}
