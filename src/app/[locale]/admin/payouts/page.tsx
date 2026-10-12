import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminPayoutsPanel from "@/components/admin/AdminPayoutsPanel"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <AdminPageShell
      locale={locale}
      active="payouts"
      title={isRtl ? "مستحقات البائعين (وسيط)" : "Seller payouts (Escrow)"}
    >
      <AdminPayoutsPanel locale={locale} />
    </AdminPageShell>
  )
}
