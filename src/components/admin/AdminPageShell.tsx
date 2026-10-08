"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { ReactNode } from "react"

export default function AdminPageShell({
  locale,
  active,
  title,
  children,
}: {
  locale: string
  active: string
  title: string
  children: ReactNode
}) {
  const isRtl = locale === "ar"
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar locale={locale} active={active} />
          <div className="flex-1 min-w-0 space-y-4">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {children}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
