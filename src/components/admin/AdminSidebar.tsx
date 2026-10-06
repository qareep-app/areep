"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CreditCard,
  Scale,
  Shield,
  Settings,
  FileText,
  AlertTriangle,
} from "lucide-react"

interface AdminSidebarProps {
  locale: string
  active: string
}

const items = [
  { id: "overview", href: "/admin", icon: LayoutDashboard, ar: "نظرة عامة", en: "Overview" },
  { id: "users", href: "/admin/users", icon: Users, ar: "المستخدمين", en: "Users" },
  { id: "ads", href: "/admin/ads", icon: Megaphone, ar: "الإعلانات", en: "Ads" },
  { id: "transactions", href: "/admin/transactions", icon: CreditCard, ar: "المعاملات", en: "Transactions" },
  { id: "contracts", href: "/admin/contracts", icon: FileText, ar: "العقود", en: "Contracts" },
  { id: "legal", href: "/admin/legal", icon: Scale, ar: "المستشارين القانونيين", en: "Legal Consultants" },
  { id: "disputes", href: "/admin/disputes", icon: AlertTriangle, ar: "النزاعات", en: "Disputes" },
  { id: "settings", href: "/admin/settings", icon: Settings, ar: "إعدادات النظام", en: "System Settings" },
]

export default function AdminSidebar({ locale, active }: AdminSidebarProps) {
  const isRtl = locale === "ar"

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sticky top-24">
        <div className="px-3 py-2 mb-2">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
            {isRtl ? "لوحة الأدمن" : "Admin Panel"}
          </span>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <Link
                key={item.id}
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                <span>{isRtl ? item.ar : item.en}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
