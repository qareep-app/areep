"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, Loader2, Clock, CheckCircle, Wallet } from "lucide-react"

interface EscrowListProps {
  locale: string
}

const statusMap: Record<string, { ar: string; en: string; color: string; icon: any }> = {
  PENDING_PAYMENT: { ar: "في انتظار الدفع", en: "Awaiting payment", color: "bg-amber-50 text-amber-700", icon: Clock },
  HELD: { ar: "تم الدفع - في انتظار التسليم", en: "Paid - awaiting delivery", color: "bg-blue-50 text-blue-700", icon: Wallet },
  DELIVERED: { ar: "تم التسليم", en: "Delivered", color: "bg-violet-50 text-violet-700", icon: CheckCircle },
  COMPLETED: { ar: "مكتملة", en: "Completed", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
  CANCELLED: { ar: "ملغاة", en: "Cancelled", color: "bg-red-50 text-red-600", icon: Clock },
}

export default function EscrowList({ locale }: EscrowListProps) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/escrow", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="text-emerald-600" size={26} />
          {isRtl ? "نظام الوسيط" : "Escrow"}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="font-semibold text-gray-900">{isRtl ? "كيف يعمل النظام؟" : "How it works?"}</h2>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>{isRtl ? "المشتري يدفع كامل المبلغ لحساب قريب (موثوق)" : "Buyer pays full amount to Areep (trusted)"}</li>
          <li>{isRtl ? "قريب يحتفظ بالفلوس (Escrow)" : "Areep holds the funds (Escrow)"}</li>
          <li>{isRtl ? "البائع يسلم السلعة / العقار" : "Seller delivers the item / property"}</li>
          <li>{isRtl ? "المشتري يؤكد الاستلام" : "Buyer confirms receipt"}</li>
          <li>{isRtl ? "قريب يحول للبائع بعد خصم العمولة تلقائياً" : "Areep pays the seller after deducting the fee"}</li>
        </ol>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 font-semibold text-gray-900">
          {isRtl ? "صفقاتي عبر الوسيط" : "My escrow deals"}
        </div>

        {loading && (
          <div className="p-12 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            {isRtl ? "جاري التحميل..." : "Loading..."}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-12 text-center text-gray-500 text-sm">
            {isRtl
              ? "مفيش صفقات وسيط لسه. لما تبدأ صفقة بوسيط قريب هتظهر هنا."
              : "No escrow deals yet. When you start an escrow deal it will appear here."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="divide-y divide-gray-50">
            {items.map((esc) => {
              const st = statusMap[esc.status] || statusMap.PENDING_PAYMENT
              const Icon = st.icon
              const title = esc.ad?.titleAr || esc.titleAr || "—"
              const amount = Number(esc.amount || 0)
              const commission = Number(esc.commission || esc.platformFee || 0)
              return (
                <div key={esc.id} className="p-4 sm:p-5 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>
                          {amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700">
                          {isRtl ? "عمولة:" : "Fee:"} {commission.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                        <Icon size={13} />
                        {isRtl ? st.ar : st.en}
                      </span>
                      <Link
                        href={`/${locale}/dashboard/escrow/${esc.id}`}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        {isRtl ? "التفاصيل" : "Details"}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
