"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, PenTool, CheckCircle, Clock, Scale, Loader2 } from "lucide-react"

interface ContractsListProps {
  locale: string
}

const statusMap: Record<string, { ar: string; en: string; color: string; icon: any }> = {
  DRAFT: { ar: "مسودة", en: "Draft", color: "bg-gray-100 text-gray-600", icon: FileText },
  PENDING_SIGNATURES: { ar: "في انتظار التوقيع", en: "Pending Signatures", color: "bg-amber-50 text-amber-700", icon: PenTool },
  PENDING_LEGAL: { ar: "في انتظار المستشار", en: "Pending Legal", color: "bg-blue-50 text-blue-700", icon: Scale },
  ACTIVE: { ar: "ساري", en: "Active", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
  COMPLETED: { ar: "مكتمل", en: "Completed", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
  CANCELLED: { ar: "ملغي", en: "Cancelled", color: "bg-red-50 text-red-600", icon: Clock },
}

export default function ContractsList({ locale }: ContractsListProps) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/contracts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-emerald-600" size={26} />
          {isRtl ? "العقود العقارية" : "Real Estate Contracts"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "عقود موثقة إلكترونياً مع مستشار قانوني معتمد + توقيع بالصورة وOTP"
            : "Electronically documented contracts with accredited legal consultant + image signature & OTP"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{isRtl ? "إيجار" : "Rent"}</h3>
          <p className="text-sm text-gray-600">
            {isRtl
              ? "عمولة: نصف شهر من المؤجر + نصف شهر من المستأجر (نصفها للمستشار القانوني)"
              : "Fee: half month from landlord + half month from tenant (half goes to legal consultant)"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{isRtl ? "تمليك" : "Sale"}</h3>
          <p className="text-sm text-gray-600">
            {isRtl
              ? "مع الوسيط: 2.5% من كل طرف | بدون وسيط: 2% من البائع (نصف العمولة للمستشار)"
              : "With escrow: 2.5% each side | Without: 2% from seller (half fee to legal)"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-12 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            {isRtl ? "جاري التحميل..." : "Loading..."}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-12 text-center text-gray-500 text-sm">
            {isRtl
              ? "مفيش عقود لسه. العقود بتظهر هنا بعد بدء صفقة عقارية مع التوقيع والمستشار."
              : "No contracts yet. They appear here after a real-estate deal with signature and legal advisor."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="divide-y divide-gray-50">
            {items.map((c) => {
              const st = statusMap[c.status] || statusMap.DRAFT
              const Icon = st.icon
              const title = c.propertyTitle || c.titleAr || c.ad?.titleAr || "—"
              const amount = Number(c.amount || c.price || 0)
              return (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">{title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {c.type === "RENT" || c.type === "إيجار" ? (isRtl ? "إيجار" : "Rent") : (isRtl ? "تمليك" : "Sale")}
                      {" · "}
                      {amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                      <Icon size={13} />
                      {isRtl ? st.ar : st.en}
                    </span>
                    <Link
                      href={`/${locale}/dashboard/contracts/${c.id}`}
                      className="text-sm font-medium text-emerald-600"
                    >
                      {isRtl ? "التفاصيل" : "Details"}
                    </Link>
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
