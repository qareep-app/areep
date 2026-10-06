"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, User, Plus, MessageCircle, LayoutDashboard } from "lucide-react"

interface HeaderProps {
  locale?: string
}

export default function Header({ locale = "ar" }: HeaderProps) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const [q, setQ] = useState("")

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    if (term) {
      router.push(`/${locale}/ads?city=${encodeURIComponent(term)}`)
    } else {
      router.push(`/${locale}/ads`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              ق
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-emerald-700 leading-none">قريب</span>
              <span className="text-xs text-orange-500 font-medium leading-none mt-0.5">دكانك قريب</span>
            </div>
          </Link>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isRtl ? "دور على مدينة أو حي..." : "Search city or area..."}
                className="w-full h-11 pr-12 pl-4 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm"
              />
              <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600">
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={locale === "ar" ? "/en" : "/ar"}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-full border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 transition"
            >
              {locale === "ar" ? "EN" : "عربي"}
            </Link>

            <Link href={`/${locale}/messages`} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600" aria-label="Messages">
              <MessageCircle size={22} />
            </Link>

            <Link href={`/${locale}/dashboard`} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600" aria-label="Dashboard">
              <LayoutDashboard size={22} />
            </Link>

            <Link href={`/${locale}/auth/login`} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600" aria-label="Account">
              <User size={22} />
            </Link>

            <Link
              href={`/${locale}/ads/new`}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2.5 rounded-full font-medium text-sm shadow-sm transition"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{isRtl ? "أضف إعلانك" : "Post Ad"}</span>
            </Link>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto pb-3 -mb-px scrollbar-hide">
          {[
            { href: `/${locale}`, label: isRtl ? "الرئيسية" : "Home" },
            { href: `/${locale}/categories`, label: isRtl ? "التصنيفات" : "Categories" },
            { href: `/${locale}/ads`, label: isRtl ? "كل الإعلانات" : "All ads" },
            { href: `/${locale}/nearby`, label: isRtl ? "قريب مني" : "Near me" },
            { href: `/${locale}/areas`, label: isRtl ? "الأحياء" : "Areas" },
            { href: `/${locale}/how-it-works`, label: isRtl ? "كيف يعمل؟" : "How it works?" },
            { href: `/${locale}/about`, label: isRtl ? "عن قريب" : "About" },
            { href: `/${locale}/contact`, label: isRtl ? "تواصل معنا" : "Contact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full whitespace-nowrap transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
