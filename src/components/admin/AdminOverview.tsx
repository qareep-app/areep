"use client"

import {
  Users,
  Megaphone,
  CreditCard,
  TrendingUp,
  Shield,
  AlertTriangle,
} from "lucide-react"

interface AdminOverviewProps {
  locale: string
}

export default function AdminOverview({ locale }: AdminOverviewProps) {
  const isRtl = locale === "ar"

  const stats = [
    { ar: "المستخدمين", en: "Users", value: "12,480", icon: Users, color: "bg-blue-50 text-blue-600" },
    { ar: "إعلانات نشطة", en: "Active Ads", value: "3,921", icon: Megaphone, color: "bg-violet-50 text-violet-600" },
    { ar: "صفقات وسيط", en: "Escrow Deals", value: "847", icon: Shield, color: "bg-emerald-50 text-emerald-600" },
    { ar: "إيرادات الشهر", en: "Monthly Revenue", value: "1.2M", icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
    { ar: "عمولات محصلة", en: "Commissions", value: "285K", icon: CreditCard, color: "bg-cyan-50 text-cyan-600" },
    { ar: "نزاعات مفتوحة", en: "Open Disputes", value: "12", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? "لوحة تحكم الأدمن" : "Admin Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl ? "إدارة كاملة لمنصة قريب" : "Full management of Areep platform"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{isRtl ? s.ar : s.en}</div>
            </div>
          )
        })}
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">
          {isRtl ? "آخر النشاطات" : "Recent Activity"}
        </h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex justify-between">
            <span>{isRtl ? "صفقة وسيط جديدة - سيارة" : "New escrow deal - Car"}</span>
            <span className="text-gray-400">منذ 12 دقيقة</span>
          </li>
          <li className="flex justify-between">
            <span>{isRtl ? "عقد عقاري تم توقيعه" : "Real estate contract signed"}</span>
            <span className="text-gray-400">منذ 45 دقيقة</span>
          </li>
          <li className="flex justify-between">
            <span>{isRtl ? "مستخدم جديد مسجل" : "New user registered"}</span>
            <span className="text-gray-400">منذ ساعة</span>
          </li>
          <li className="flex justify-between">
            <span>{isRtl ? "نزاع تم فتحه" : "Dispute opened"}</span>
            <span className="text-red-500">منذ ساعتين</span>
          </li>
        </ul>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800">
        {isRtl
          ? "⚠️ لوحة الأدمن محمية. يجب التحقق من صلاحية ADMIN قبل الوصول لأي بيانات حساسة."
          : "⚠️ Admin panel is protected. ADMIN role must be verified before accessing sensitive data."}
      </div>
    </div>
  )
}
