import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminSettingsPanel from "@/components/admin/AdminSettingsPanel"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  const title = isRtl ? "إعدادات النظام" : "System Settings"
  return (
    <AdminPageShell locale={locale} active="settings" title={title}>
      <AdminSettingsPanel locale={locale} />
    </AdminPageShell>
  )
}
