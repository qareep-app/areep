"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, User, Plus, MessageCircle, LayoutDashboard, Moon, Sun } from "lucide-react"

interface HeaderProps {
  locale?: string
}

export default function Header({ locale = "ar" }: HeaderProps) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const [q, setQ] = useState("")
  const [dark, setDark] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("areep-theme")
      const preferDark =
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      setDark(preferDark)
      document.documentElement.classList.toggle("dark", preferDark)
    } catch {}
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("areep-theme", next ? "dark" : "light")
    } catch {}
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    if (term) {
      router.push(`/${locale}/ads?q=${encodeURIComponent(term)}`)
    } else {
      router.push(`/${locale}/ads`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/app-icon.png"
              alt="قريب"
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                قريب
              </span>
              <span className="text-[10px] text-orange-500 font-medium leading-none mt-0.5">
                دكانك قريب
              </span>
            </div>
          </Link>

          {/* Search — center */}
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isRtl ? "بتدور على إيه؟" : "What are you looking for?"}
                className="w-full h-11 pe-4 ps-12 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm"
              />
              <button
                type="submit"
                className="absolute start-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Actions — evenly spaced, not clustered only on one side */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={toggleDark}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
              aria-label={dark ? "Light mode" : "Dark mode"}
              title={isRtl ? (dark ? "الوضع النهاري" : "الوضع الليلي") : dark ? "Light" : "Dark"}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              href={locale === "ar" ? "/en" : "/ar"}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
            >
              {locale === "ar" ? "EN" : "عربي"}
            </Link>

            <Link
              href={`/${locale}/messages`}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              aria-label="Messages"
            >
              <MessageCircle size={20} />
            </Link>

            <Link
              href={`/${locale}/dashboard`}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              aria-label="Dashboard"
            >
              <LayoutDashboard size={20} />
            </Link>

            <Link
              href={`/${locale}/auth/login`}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              aria-label="Account"
            >
              <User size={20} />
            </Link>

            <Link
              href={`/${locale}/ads/new`}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-full font-medium text-sm shadow-sm transition ms-1"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{isRtl ? "أضف إعلان" : "Post ad"}</span>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={onSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isRtl ? "بتدور على إيه؟" : "What are you looking for?"}
              className="w-full h-10 pe-4 ps-11 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500"
            />
            <Search
              size={16}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
