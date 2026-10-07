"use client"

import Link from "next/link"
import { useRef } from "react"
import {
  Car, Wrench, Bike, Settings, Building2, Smartphone,
  Tv, Sofa, Shirt, PawPrint, Briefcase, Package, Home,
  HandHelping, GraduationCap, Gamepad2, UtensilsCrossed,
  PartyPopper, Code2, Trees, Palette, Plane, Map,
  Gem, Search, ChevronLeft, ChevronRight,
} from "lucide-react"

interface Props {
  locale?: string
}

const categories = [
  { slug: "", icon: Home, nameAr: "الرئيسية", nameEn: "Home", gradient: "from-emerald-400 to-emerald-600" },
  { slug: "cars", icon: Car, nameAr: "سيارات", nameEn: "Cars", gradient: "from-blue-400 to-blue-600" },
  { slug: "car-parts", icon: Wrench, nameAr: "قطع غيار", nameEn: "Parts", gradient: "from-slate-400 to-slate-600" },
  { slug: "motorcycles", icon: Bike, nameAr: "موتسيكلات", nameEn: "Bikes", gradient: "from-orange-400 to-orange-600" },
  { slug: "motorcycle-parts", icon: Settings, nameAr: "قطع موتسيكل", nameEn: "Bike parts", gradient: "from-amber-400 to-amber-600" },
  { slug: "real-estate-sale", icon: Building2, nameAr: "تمليك", nameEn: "Sale", gradient: "from-emerald-400 to-teal-600" },
  { slug: "real-estate-rent", icon: Building2, nameAr: "إيجار", nameEn: "Rent", gradient: "from-teal-400 to-cyan-600" },
  { slug: "mobiles", icon: Smartphone, nameAr: "موبايلات", nameEn: "Phones", gradient: "from-indigo-400 to-indigo-600" },
  { slug: "electronics", icon: Tv, nameAr: "أجهزة", nameEn: "Electronics", gradient: "from-cyan-400 to-sky-600" },
  { slug: "furniture", icon: Sofa, nameAr: "أثاث", nameEn: "Furniture", gradient: "from-rose-400 to-rose-600" },
  { slug: "fashion", icon: Shirt, nameAr: "أزياء", nameEn: "Fashion", gradient: "from-pink-400 to-fuchsia-600" },
  { slug: "pets", icon: PawPrint, nameAr: "حيوانات", nameEn: "Pets", gradient: "from-lime-400 to-green-600" },
  { slug: "jobs", icon: Briefcase, nameAr: "وظائف", nameEn: "Jobs", gradient: "from-violet-400 to-purple-600" },
  { slug: "services", icon: HandHelping, nameAr: "خدمات", nameEn: "Services", gradient: "from-sky-400 to-blue-500" },
  { slug: "training", icon: GraduationCap, nameAr: "تدريب", nameEn: "Training", gradient: "from-amber-400 to-orange-500" },
  { slug: "games", icon: Gamepad2, nameAr: "ألعاب", nameEn: "Games", gradient: "from-purple-400 to-violet-600" },
  { slug: "food", icon: UtensilsCrossed, nameAr: "طعام", nameEn: "Food", gradient: "from-red-400 to-rose-500" },
  { slug: "events", icon: PartyPopper, nameAr: "مناسبات", nameEn: "Events", gradient: "from-pink-400 to-rose-500" },
  { slug: "programming", icon: Code2, nameAr: "برمجة", nameEn: "Programming", gradient: "from-slate-500 to-gray-700" },
  { slug: "gardens", icon: Trees, nameAr: "حدائق", nameEn: "Gardens", gradient: "from-green-400 to-emerald-600" },
  { slug: "arts", icon: Palette, nameAr: "فنون", nameEn: "Arts", gradient: "from-fuchsia-400 to-purple-500" },
  { slug: "tourism", icon: Plane, nameAr: "سياحة", nameEn: "Tourism", gradient: "from-cyan-400 to-blue-500" },
  { slug: "trips", icon: Map, nameAr: "رحلات", nameEn: "Trips", gradient: "from-teal-400 to-cyan-600" },
  { slug: "antiques", icon: Gem, nameAr: "نوادر", nameEn: "Antiques", gradient: "from-yellow-500 to-amber-600" },
  { slug: "lost-found", icon: Search, nameAr: "مفقودات", nameEn: "Lost & Found", gradient: "from-gray-400 to-slate-600" },
  { slug: "other", icon: Package, nameAr: "أخرى", nameEn: "Other", gradient: "from-gray-400 to-gray-600" },
]

export default function CategoryBar({ locale = "ar" }: Props) {
  const isRtl = locale === "ar"
  const scroller = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    const el = scroller.current
    if (!el) return
    const amount = 240
    const delta = dir === "left" ? -amount : amount
    el.scrollBy({ left: isRtl ? -delta : delta, behavior: "smooth" })
  }

  return (
    <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[6.5rem] z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute start-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center hover:bg-gray-50 hidden sm:flex"
          aria-label="scroll"
        >
          {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute end-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center hover:bg-gray-50 hidden sm:flex"
          aria-label="scroll"
        >
          {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        <div
          ref={scroller}
          className="flex items-stretch justify-start gap-2 overflow-x-auto py-3 px-9 scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon
            const href = cat.slug ? `/${locale}/ads?category=${cat.slug}` : `/${locale}`
            return (
              <Link
                key={cat.slug || "home"}
                href={href}
                className="flex flex-col items-center justify-center gap-1.5 min-w-[76px] w-[76px] shrink-0"
              >
                {/* 3D rectangular tile — icon centered */}
                <div
                  className={`w-14 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white`}
                  style={{
                    boxShadow:
                      "0 6px 10px -2px rgb(0 0 0 / 0.18), 0 2px 4px -2px rgb(0 0 0 / 0.1), inset 0 1px 0 rgb(255 255 255 / 0.28)",
                  }}
                >
                  <Icon size={22} strokeWidth={2.1} className="mx-auto" />
                </div>
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight w-full">
                  {isRtl ? cat.nameAr : cat.nameEn}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
