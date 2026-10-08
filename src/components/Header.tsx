"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Search, User, Plus, MessageCircle, LayoutDashboard, Moon, Sun, Menu, X, Scale,
} from "lucide-react"

interface HeaderProps {
  locale?: string
}

const navLinks = [
  { href: "", labelAr: "الرئيسية", labelEn: "Home" },
  { href: "categories", labelAr: "التصنيفات", labelEn: "Categories" },
  { href: "ads", labelAr: "كل الإعلانات", labelEn: "All ads" },
  { href: "ads?nearby=1", labelAr: "قريب مني", labelEn: "Nearby" },
  { href: "areas", labelAr: "الأحياء", labelEn: "Areas" },
  { href: "how-it-works", labelAr: "كيف يعمل؟", labelEn: "How it works" },
  { href: "about", labelAr: "عن قريب", labelEn: "About" },
  { href: "contact", labelAr: "تواصل معنا", labelEn: "Contact" },
]

export default function Header({ locale = "ar" }: HeaderProps) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const [q, setQ] = useState("")
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("areep-theme")
      const preferDark =
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      setDark(preferDark)
      document.documentElement.classList.toggle("dark", preferDark)
      document.body.classList.toggle("dark", preferDark)
    } catch {}
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    document.body.classList.toggle("dark", next)
    try {
      localStorage.setItem("areep-theme", next ? "dark" : "light")
    } catch {}
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    router.push(term ? `/${locale}/ads?q=${encodeURIComponent(term)}` : `/${locale}/ads`)
  }

  const linkHref = (path: string) => {
    if (!path) return `/${locale}`
    if (path.includes("?")) {
      const [p, qs] = path.split("?")
      return `/${locale}/${p}?${qs}`
    }
    return `/${locale}/${path}`
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 h-14 sm:h-16">
          {/* Brand: icon + name + slogan */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/app-icon.png"
              alt="قريب"
              className="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
            />
            <div className="leading-tight">
              <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400">
                قريب
              </div>
              <div className="text-[10px] sm:text-xs text-orange-500 font-medium">
                دكانك قريب
              </div>
            </div>
          </Link>

          <form onSubmit={onSearch} className="flex-1 min-w-0 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isRtl ? "دور على مدينة أو حي..." : "Search city or area..."}
                className="w-full h-10 sm:h-11 pe-4 ps-11 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="submit"
                className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleDark}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
              aria-label="theme"
              title={isRtl ? (dark ? "نهاري" : "ليلي") : dark ? "Light" : "Dark"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              href={locale === "ar" ? "/en" : "/ar"}
              className="px-2 py-1.5 text-xs font-semibold rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
            >
              {locale === "ar" ? "EN" : "عربي"}
            </Link>

            <Link
              href={`/${locale}/messages`}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
              aria-label="chat"
            >
              <MessageCircle size={20} />
            </Link>

            <Link
              href={`/${locale}/legal-advisor`}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
              aria-label="legal"
              title={isRtl ? "مستشار قانوني" : "Legal advisor"}
            >
              <Scale size={20} />
            </Link>

            <Link
              href={`/${locale}/dashboard`}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 hidden sm:inline-flex"
              aria-label="dashboard"
            >
              <LayoutDashboard size={20} />
            </Link>

            <Link
              href={`/${locale}/auth/login`}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300"
              aria-label="account"
            >
              <User size={20} />
            </Link>

            <Link
              href={`/${locale}/seller/register`}
              className="hidden md:inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
            >
              {isRtl ? "سجّل كبائع" : "Become seller"}
            </Link>
            <Link
              href={`/${locale}/ads/new`}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-full font-medium text-sm shadow-sm ms-1"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{isRtl ? "أضف إعلانك" : "Post ad"}</span>
            </Link>

            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-5 pb-2.5 text-sm text-gray-600 dark:text-gray-300">
          {navLinks.map((l) => (
            <Link
              key={l.href || "home"}
              href={linkHref(l.href)}
              className="hover:text-emerald-600 transition whitespace-nowrap"
            >
              {isRtl ? l.labelAr : l.labelEn}
            </Link>
          ))}
        </nav>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href || "home"}
              href={linkHref(l.href)}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:text-emerald-600"
            >
              {isRtl ? l.labelAr : l.labelEn}
            </Link>
          ))}
          <Link
            href={`/${locale}/legal-advisor`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 py-2.5 text-sm text-gray-700 dark:text-gray-200"
          >
            <Scale size={16} />
            {isRtl ? "مستشار قانوني" : "Legal advisor"}
          </Link>
        </div>
      )}
    </header>
  )
}
