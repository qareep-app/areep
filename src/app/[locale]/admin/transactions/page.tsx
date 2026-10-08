import { setRequestLocale } from "next-intl/server"
import AdminPageShell from "@/components/admin/AdminPageShell"

type Props = { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  const title = isRtl ? "المعاملات" : "Transactions"
  return (
    <AdminPageShell locale={locale} active="transactions" title={title}>
      <div className="bg-white rounded-2xl border p-6 text-sm text-gray-600 space-y-2">
        <p>{isRtl ? "قسم المعاملات — البيانات تظهر هنا من قاعدة البيانات عند توفرها." : "Transactions section — data loads from the database when available."}</p>
        <p className="text-xs text-gray-400">
          {isRtl ? "الصفحة جاهزة ومربوطة بالقائمة. المحتوى التفصيلي يتوسع تدريجياً." : "Page is live and linked. Detail views expand next."}
        </p>
      </div>
    </AdminPageShell>
  )
}
