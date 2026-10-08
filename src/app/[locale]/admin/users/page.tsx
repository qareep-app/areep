import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminUsers from "@/components/admin/AdminUsers"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === "ar" ? "المستخدمين" : "Users"
  return (
    <AdminPageShell locale={locale} active="users" title={title}>
      <AdminUsers locale={locale} />
    </AdminPageShell>
  )
}
