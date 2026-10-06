"use client"

import Link from "next/link"
import { Shield, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface EscrowListProps {
  locale: string
}

const mockEscrows = [
  {
    id: "esc-1",
    adTitleAr: "تويوتا كورولا 2020",
    adTitleEn: "Toyota Corolla 2020",
    role: "seller",
    amount: 850000,
    commission: 42500,
    status: "PAID",
    buyerName: "محمد أ.",
    createdAt: "2026-10-01",
  },
  {
    id: "esc-2",
    adTitleAr: "شقة 150م - المعادي",
    adTitleEn: "150m Apartment - Maadi",
    role: "buyer",
    amount: 2500000,
    commission: 125000,
    status: "PENDING",
    buyerName: "أنت",
    createdAt: "2026-10-02",
  },
  {
    id: "esc-3",
    adTitleAr: "موتوسيكل هوندا 2023",
    adTitleEn: "Honda Motorcycle 2023",
    role: "seller",
    amount: 95000,
    commission: 4750,
    status: "COMPLETED",
    buyerName: "خالد م.",
    createdAt: "2026-09-25",
  },
]

const statusConfig: Record<string, { ar: string; en: string; color: string; icon: any }> = {
  PENDING: { ar: "في انتظار الدفع", en: "Awaiting Payment", color: "bg-amber-50 text-amber-700", icon: Clock },
  PAID: { ar: "تم الدفع - في انتظار التسليم", en: "Paid - Awaiting Delivery", color: "bg-blue-50 text-blue-700", icon: Shield },
  DELIVERED: { ar: "تم التسليم - في انتظار التأكيد", en: "Delivered - Awaiting Confirmation", color: "bg-indigo-50 text-indigo-700", icon: AlertCircle },
  COMPLETED: { ar: "مكتملة", en: "Completed", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
  CANCELLED: { ar: "ملغاة", en: "Cancelled", color: "bg-red-50 text-red-700", icon: XCircle },
  DISPUTED: { ar: "نزاع", en: "Disputed", color: "bg-rose-50 text-rose-700", icon: AlertCircle },
}

export default function EscrowList({ locale }: EscrowListProps) {
  const isRtl = locale === "ar"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="text-emerald-600" size={26} />
          {isRtl ? "نظام وسيط قريب" : "Areep Escrow"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "حماية كاملة لفلوسك في الصفقات الحساسة (سيارات – عقارات – قطع غيار)"
            : "Full protection for your money in sensitive deals (cars – real estate – parts)"}
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-3">
          {isRtl ? "كيف يعمل النظام؟" : "How does it work?"}
        </h2>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>{isRtl ? "المشتري يدفع كامل المبلغ لحساب قريب (موثوق)" : "Buyer pays the full amount to Areep account"}</li>
          <li>{isRtl ? "قريب يحتفظ بالفلوس (Escrow)" : "Areep holds the money safely"}</li>
          <li>{isRtl ? "البائع يسلم السلعة / العقار" : "Seller delivers the item / property"}</li>
          <li>{isRtl ? "المشتري يؤكد الاستلام" : "Buyer confirms receipt"}</li>
          <li>{isRtl ? "قريب يحول للبائع بعد خصم العمولة تلقائياً" : "Areep releases money to seller after deducting commission"}</li>
        </ol>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900">
          {isRtl ? "صفقاتي عبر الوسيط" : "My Escrow Deals"}
        </div>

        {mockEscrows.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            {isRtl ? "مفيش صفقات وسيط حالياً" : "No escrow deals yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {mockEscrows.map((esc) => {
              const st = statusConfig[esc.status] || statusConfig.PENDING
              const Icon = st.icon
              return (
                <div key={esc.id} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {isRtl ? esc.adTitleAr : esc.adTitleEn}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          {esc.role === "seller"
                            ? isRtl ? `المشتري: ${esc.buyerName}` : `Buyer: ${esc.buyerName}`
                            : isRtl ? "أنت المشتري" : "You are the buyer"}
                        </span>
                        <span>·</span>
                        <span>{esc.amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}</span>
                        <span>·</span>
                        <span className="text-emerald-700">
                          {isRtl ? "عمولة:" : "Fee:"} {esc.commission.toLocaleString()}
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
