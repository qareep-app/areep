import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminLegal from "@/components/admin/AdminLegal"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === "ar" ? "المستشارين القانونيين" : "Legal"
  return (
    <AdminPageShell locale={locale} active="legal" title={title}>
      <AdminLegal locale={locale} />
    </AdminPageShell>
  )
}
