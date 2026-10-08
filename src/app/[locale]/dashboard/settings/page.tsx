"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import Link from "next/link"
import { LogIn, Store, Shield, LogOut } from "lucide-react"

export default function SettingsPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"
  const [user, setUser] = useState<{ role?: string; phone?: string; name?: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
  }, [])

  const isAdmin = user?.role === "ADMIN"
  const isSeller =
    user?.role === "SELLER" ||
    user?.role === "SELLER_PRO" ||
    user?.role === "SELLER_PENDING"

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" })
    try {
      localStorage.removeItem("areep_user")
    } catch {}
    window.location.href = `/${locale}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar locale={locale} active="settings" />
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl border p-6 space-y-2">
              <h1 className="text-xl font-bold">{isRtl ? "الإعدادات" : "Settings"}</h1>
              <p className="text-sm text-gray-500">
                {isRtl ? "إدارة حسابك على قريب" : "Manage your Areep account"}
              </p>
              {user?.phone && (
                <p className="text-sm text-gray-600" dir="ltr">
                  {user.phone}
                  {user.role ? ` · ${user.role}` : ""}
                </p>
              )}
            </div>

            {/* عام لكل المستخدمين */}
            <div className="bg-white rounded-2xl border p-5 space-y-3">
              <h2 className="font-semibold text-gray-800 text-sm">
                {isRtl ? "الحساب" : "Account"}
              </h2>
              {!user && (
                <Link
                  href={`/${locale}/auth/login`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border hover:bg-gray-50 text-sm"
                >
                  <LogIn size={16} />
                  {isRtl ? "تسجيل الدخول برقم الموبايل" : "Login with mobile"}
                </Link>
              )}
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border hover:bg-gray-50 text-sm w-full text-start"
                >
                  <LogOut size={16} />
                  {isRtl ? "تسجيل الخروج" : "Log out"}
                </button>
              )}
            </div>

            {/* بائع فقط — مش للأدمن */}
            {!isAdmin && (
              <div className="bg-white rounded-2xl border p-5 space-y-3">
                <h2 className="font-semibold text-gray-800 text-sm">
                  {isRtl ? "البيع على قريب" : "Selling on Areep"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isRtl
                    ? "أي مستخدم يقدر يسجّل كبائع بعد موافقة المراجعة. ده مش مرتبط بلوحة الأدمن."
                    : "Any user can apply as seller. This is separate from the admin panel."}
                </p>
                {isSeller ? (
                  <p className="text-sm text-emerald-700">
                    {isRtl
                      ? user?.role === "SELLER_PENDING"
                        ? "طلب البائع قيد المراجعة"
                        : "حسابك مفعّل كبائع"
                      : "Seller account active / pending"}
                  </p>
                ) : (
                  <Link
                    href={`/${locale}/seller/register`}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-sm font-medium"
                  >
                    <Store size={16} />
                    {isRtl ? "سجّل كبائع" : "Become a seller"}
                  </Link>
                )}
              </div>
            )}

            {/* أدمن فقط */}
            {isAdmin && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <h2 className="font-semibold text-emerald-900 text-sm flex items-center gap-2">
                  <Shield size={16} />
                  {isRtl ? "صلاحيات الإدارة" : "Administration"}
                </h2>
                <p className="text-xs text-emerald-800">
                  {isRtl
                    ? "حساب الأدمن منفصل: يدير المستخدمين والبائعين والعمولات والاستشارات — مش حساب بائع عادي."
                    : "Admin is separate: manages users, sellers, fees — not a normal seller account."}
                </p>
                <Link
                  href={`/${locale}/admin`}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 text-white text-sm font-semibold"
                >
                  {isRtl ? "فتح لوحة تحكم الأدمن" : "Open admin panel"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
