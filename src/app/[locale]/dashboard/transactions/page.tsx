import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"

type Props = { params: Promise<{ locale: string }> }

export default async function TransactionsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  const transactions = [
    { id: "1", ad: isRtl ? "تويوتا كورولا 2020" : "Toyota Corolla 2020", amount: 850000, commission: 42500, status: "completed", date: "2026-09-28" },
    { id: "2", ad: isRtl ? "آيفون 14 برو" : "iPhone 14 Pro", amount: 28500, commission: 570, status: "completed", date: "2026-09-20" },
    { id: "3", ad: isRtl ? "شقة المعادي" : "Maadi Apartment", amount: 2500000, commission: 125000, status: "pending", date: "2026-10-01" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar locale={locale} active="transactions" />
            <div className="flex-1 min-w-0 space-y-5">
              <h1 className="text-2xl font-bold text-gray-900">
                {isRtl ? "المعاملات والعمولات" : "Transactions & Commissions"}
              </h1>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-start px-5 py-3 font-medium">{isRtl ? "الإعلان" : "Ad"}</th>
                        <th className="text-start px-5 py-3 font-medium">{isRtl ? "المبلغ" : "Amount"}</th>
                        <th className="text-start px-5 py-3 font-medium">{isRtl ? "عمولة قريب" : "Areep Fee"}</th>
                        <th className="text-start px-5 py-3 font-medium">{isRtl ? "الحالة" : "Status"}</th>
                        <th className="text-start px-5 py-3 font-medium">{isRtl ? "التاريخ" : "Date"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 font-medium text-gray-900">{t.ad}</td>
                          <td className="px-5 py-4">{t.amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}</td>
                          <td className="px-5 py-4 text-emerald-700 font-medium">{t.commission.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              t.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {t.status === "completed" ? (isRtl ? "مكتملة" : "Completed") : (isRtl ? "قيد الانتظار" : "Pending")}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{t.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                {isRtl
                  ? "العمولات تُحسب تلقائياً حسب قواعد كل فئة (2% أو 2.5% مع الوسيط). لا يمكن إتمام أي صفقة بدون احتساب العمولة."
                  : "Commissions are calculated automatically per category rules (2% or 2.5% with escrow). No deal can complete without commission calculation."}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
