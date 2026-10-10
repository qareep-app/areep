"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import { User, Store, Megaphone, Package, Shield, Scale, Save, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user)
        setName(d.user?.name || "")
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    setMsg("")
    try {
      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "fail")
      setMsg(isRtl ? "تم حفظ البيانات" : "Saved")
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar locale={locale} active="settings" />
            <div className="flex-1 min-w-0 space-y-5">
              <h1 className="text-2xl font-bold text-gray-900">
                {isRtl ? "الإعدادات" : "Settings"}
              </h1>

              <div className="bg-white rounded-2xl border p-5 space-y-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <User size={18} className="text-emerald-600" />
                  {isRtl ? "بيانات الحساب" : "Account profile"}
                </h2>
                <div className="text-sm text-gray-500">
                  {isRtl ? "رقم الموبايل:" : "Phone:"}{" "}
                  <span className="font-medium text-gray-800">{user?.phone || "—"}</span>
                </div>
                <label className="block text-sm">
                  <span className="text-gray-600">{isRtl ? "الاسم الظاهر" : "Display name"}</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5"
                    placeholder={isRtl ? "اسمك أو اسم المحل" : "Your name or shop"}
                  />
                </label>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isRtl ? "حفظ" : "Save"}
                </button>
                {msg && <p className="text-sm text-emerald-700">{msg}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { href: `/${locale}/dashboard/ads`, icon: Megaphone, ar: "إدارة إعلاناتي", en: "Manage my ads" },
                  { href: `/${locale}/ads/new`, icon: Megaphone, ar: "أضف إعلان جديد", en: "Post new ad" },
                  { href: `/${locale}/seller/register`, icon: Store, ar: "سجّل / حدّث حساب بائع", en: "Seller registration" },
                  { href: `/${locale}/dashboard/packages`, icon: Package, ar: "الباقات والاشتراك", en: "Packages" },
                  { href: `/${locale}/dashboard/escrow`, icon: Shield, ar: "نظام الوسيط", en: "Escrow" },
                  { href: `/${locale}/dashboard/legal`, icon: Scale, ar: "المستشار القانوني", en: "Legal advisor" },
                ].map((x) => {
                  const Icon = x.icon
                  return (
                    <Link
                      key={x.href}
                      href={x.href}
                      className="bg-white border rounded-2xl p-4 flex items-center gap-3 hover:border-emerald-200 hover:bg-emerald-50/40 text-sm font-medium"
                    >
                      <Icon size={18} className="text-emerald-600" />
                      {isRtl ? x.ar : x.en}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
