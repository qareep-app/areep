"use client"

import Link from "next/link"
import { FileText, PenTool, CheckCircle, Clock, Scale } from "lucide-react"

interface ContractsListProps {
  locale: string
}

const mockContracts = [
  {
    id: "ctr-1",
    type: "SALE",
    propertyAr: "شقة 150م - المعادي",
    propertyEn: "150m Apartment - Maadi",
    amount: 2500000,
    status: "PENDING_SIGNATURES",
    legalConsultant: "أ/ محمود حسن",
    createdAt: "2026-10-01",
  },
  {
    id: "ctr-2",
    type: "RENT",
    propertyAr: "شقة إيجار - مدينة نصر",
    propertyEn: "Rental Apartment - Nasr City",
    amount: 8000,
    status: "ACTIVE",
    legalConsultant: "أ/ سارة علي",
    createdAt: "2026-09-15",
  },
  {
    id: "ctr-3",
    type: "SALE",
    propertyAr: "فيلا - الشيخ زايد",
    propertyEn: "Villa - Sheikh Zayed",
    amount: 12000000,
    status: "COMPLETED",
    legalConsultant: "أ/ محمود حسن",
    createdAt: "2026-08-20",
  },
]

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

      {/* Info cards */}
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
              : "With escrow: 2.5% each | Without: 2% from seller (half fee to legal consultant)"}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {mockContracts.map((c) => {
            const st = statusMap[c.status] || statusMap.DRAFT
            const Icon = st.icon
            return (
              <div key={c.id} className="p-5 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {isRtl ? c.propertyAr : c.propertyEn}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-3">
                    <span>{c.type === "SALE" ? (isRtl ? "تمليك" : "Sale") : (isRtl ? "إيجار" : "Rent")}</span>
                    <span>·</span>
                    <span>{c.amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}</span>
                    <span>·</span>
                    <span>{isRtl ? "المستشار:" : "Legal:"} {c.legalConsultant}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                    <Icon size={13} />
                    {isRtl ? st.ar : st.en}
                  </span>
                  <Link
                    href={`/${locale}/dashboard/contracts/${c.id}`}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    {isRtl ? "التفاصيل" : "Details"}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
