"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  CreditCard,
  Package,
  Settings,
  Shield,
  FileText,
} from "lucide-react"

interface DashboardSidebarProps {
  locale: string
  active: string
}

const menuItems = [
  { id: "overview", href: "/dashboard", icon: LayoutDashboard, labelAr: "نظرة عامة", labelEn: "Overview" },
  { id: "ads", href: "/dashboard/ads", icon: Megaphone, labelAr: "إعلاناتي", labelEn: "My Ads" },
  { id: "messages", href: "/messages", icon: MessageCircle, labelAr: "الرسائل", labelEn: "Messages" },
  { id: "transactions", href: "/dashboard/transactions", icon: CreditCard, labelAr: "المعاملات", labelEn: "Transactions" },
  { id: "packages", href: "/dashboard/packages", icon: Package, labelAr: "الباقات", labelEn: "Packages" },
  { id: "escrow", href: "/dashboard/escrow", icon: Shield, labelAr: "نظام الوسيط", labelEn: "Escrow" },
  { id: "contracts", href: "/dashboard/contracts", icon: FileText, labelAr: "العقود", labelEn: "Contracts" },
  { id: "settings", href: "/dashboard/settings", icon: Settings, labelAr: "الإعدادات", labelEn: "Settings" },
]

export default function DashboardSidebar({ locale, active }: DashboardSidebarProps) {
  const isRtl = locale === "ar"

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sticky top-24">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <Link
                key={item.id}
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{isRtl ? item.labelAr : item.labelEn}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
