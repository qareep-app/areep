import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminAds from "@/components/admin/AdminAds"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === "ar" ? "الإعلانات" : "Ads"
  return (
    <AdminPageShell locale={locale} active="ads" title={title}>
      <AdminAds locale={locale} />
    </AdminPageShell>
  )
}
