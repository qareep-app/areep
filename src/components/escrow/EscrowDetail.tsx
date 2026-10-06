"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  CheckCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Package,
  AlertTriangle,
} from "lucide-react"
import { calculateCommission } from "@/lib/commission"

interface EscrowDetailProps {
  locale: string
  escrowId: string
}

export default function EscrowDetail({ locale, escrowId }: EscrowDetailProps) {
  const isRtl = locale === "ar"
  const [status, setStatus] = useState<"PENDING" | "PAID" | "DELIVERED" | "COMPLETED">("PAID")
  const [loading, setLoading] = useState(false)

  // Mock deal data (will come from API)
  const deal = {
    id: escrowId,
    adTitleAr: "تويوتا كورولا 2020 حالة ممتازة",
    adTitleEn: "Toyota Corolla 2020 excellent condition",
    amount: 850000,
    category: "cars",
    useEscrow: true,
    role: "seller" as "seller" | "buyer",
    otherParty: "محمد أحمد",
    createdAt: "2026-10-01 14:30",
  }

  const commission = calculateCommission({
    amount: deal.amount,
    commissionType: "CARS_PARTS",
    useEscrow: true,
  })

  const handleAction = async (action: "confirm_delivery" | "confirm_receipt" | "pay") => {
    setLoading(true)
    // TODO: Call API /api/escrow/...
    await new Promise((r) => setTimeout(r, 800))
    if (action === "pay") setStatus("PAID")
    if (action === "confirm_delivery") setStatus("DELIVERED")
    if (action === "confirm_receipt") setStatus("COMPLETED")
    setLoading(false)
  }

  const steps = [
    { key: "PENDING", labelAr: "في انتظار الدفع", labelEn: "Awaiting Payment" },
    { key: "PAID", labelAr: "تم الدفع", labelEn: "Paid" },
    { key: "DELIVERED", labelAr: "تم التسليم", labelEn: "Delivered" },
    { key: "COMPLETED", labelAr: "مكتملة", labelEn: "Completed" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === status)

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`/${locale}/dashboard/escrow`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600"
      >
        {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {isRtl ? "رجوع للصفقات" : "Back to deals"}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {isRtl ? deal.adTitleAr : deal.adTitleEn}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRtl ? "رقم الصفقة:" : "Deal ID:"} {deal.id} · {deal.createdAt}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">
          {isRtl ? "مراحل الصفقة" : "Deal Progress"}
        </h2>
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, i) => {
            const done = i <= currentStepIndex
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    done ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <CheckCircle size={18} /> : i + 1}
                </div>
                <span className={`text-xs mt-2 text-center ${done ? "text-emerald-700 font-medium" : "text-gray-400"}`}>
                  {isRtl ? step.labelAr : step.labelEn}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Financial Breakdown - Protected Commission */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">
          {isRtl ? "التفاصيل المالية (محمية)" : "Financial Breakdown (Protected)"}
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{isRtl ? "قيمة الصفقة" : "Deal Amount"}</span>
            <span className="font-medium">{deal.amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{isRtl ? "عمولة البائع (2.5%)" : "Seller Commission (2.5%)"}</span>
            <span className="text-red-600">-{commission.sellerCommission.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{isRtl ? "عمولة المشتري (2.5%)" : "Buyer Commission (2.5%)"}</span>
            <span className="text-red-600">-{commission.buyerCommission.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
            <span>{isRtl ? "إجمالي عمولة قريب" : "Total Areep Fee"}</span>
            <span className="text-emerald-700">{commission.platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>{isRtl ? "البائع يستلم" : "Seller Receives"}</span>
            <span className="text-emerald-700">{commission.sellerReceives.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>{isRtl ? "المشتري يدفع إجمالي" : "Buyer Pays Total"}</span>
            <span>{commission.buyerPaysTotal.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {commission.breakdown.details}
        </p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-900">
          {isRtl ? "الإجراءات" : "Actions"}
        </h2>

        {status === "PENDING" && deal.role === "buyer" && (
          <button
            onClick={() => handleAction("pay")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
          >
            <CreditCard size={20} />
            {loading ? (isRtl ? "جاري التحويل..." : "Processing...") : isRtl ? "ادفع الآن عبر Paymob" : "Pay now via Paymob"}
          </button>
        )}

        {status === "PAID" && deal.role === "seller" && (
          <button
            onClick={() => handleAction("confirm_delivery")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
          >
            <Package size={20} />
            {loading ? (isRtl ? "جاري التأكيد..." : "Confirming...") : isRtl ? "تأكيد تسليم السلعة" : "Confirm Item Delivered"}
          </button>
        )}

        {status === "DELIVERED" && deal.role === "buyer" && (
          <button
            onClick={() => handleAction("confirm_receipt")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
          >
            <CheckCircle size={20} />
            {loading ? (isRtl ? "جاري التأكيد..." : "Confirming...") : isRtl ? "تأكيد الاستلام وإتمام الصفقة" : "Confirm Receipt & Complete"}
          </button>
        )}

        {status === "COMPLETED" && (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl p-4">
            <CheckCircle size={22} />
            <span className="font-medium">
              {isRtl ? "تم إتمام الصفقة وتحويل المبلغ للبائع بنجاح" : "Deal completed and money released to seller"}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            {isRtl
              ? "العمولة تُحسب تلقائياً ولا يمكن تجاوزها. في حالة النزاع يتم تجميد المبلغ حتى الحل."
              : "Commission is calculated automatically and cannot be bypassed. In case of dispute, funds are held until resolution."}
          </span>
        </div>
      </div>
    </div>
  )
}
