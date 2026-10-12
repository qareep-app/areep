import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"
import AdminCommissionInvoices from "@/components/admin/AdminCommissionInvoices"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <AdminPageShell
      locale={locale}
      active="commission-invoices"
      title={locale === "ar" ? "فواتير العمولة" : "Commission invoices"}
    >
      <AdminCommissionInvoices locale={locale} />
    </AdminPageShell>
  )
}
