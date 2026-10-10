"use client"

import Link from "next/link"
import { useRef } from "react"
import {
  Car, Wrench, Bike, Settings, Building2, Smartphone,
  Tv, Sofa, Shirt, PawPrint, Briefcase, Package, Home,
  HandHelping, GraduationCap, Gamepad2, UtensilsCrossed,
  PartyPopper, Code2, Trees, Palette, Plane, Map,
  Gem, Search, ChevronLeft, ChevronRight, HardHat,
} from "lucide-react"

interface Props {
  locale?: string
}

const iconMap: Record<string, any> = {
  "": Home,
  cars: Car,
  "car-parts": Wrench,
  motorcycles: Bike,
  "motorcycle-parts": Settings,
  maintenance: HardHat,
  "real-estate-sale": Building2,
  "real-estate-rent": Building2,
  mobiles: Smartphone,
  electronics: Tv,
  furniture: Sofa,
  fashion: Shirt,
  pets: PawPrint,
  jobs: Briefcase,
  services: HandHelping,
  training: GraduationCap,
  games: Gamepad2,
  food: UtensilsCrossed,
  events: PartyPopper,
  programming: Code2,
  gardens: Trees,
  arts: Palette,
  tourism: Plane,
  trips: Map,
  antiques: Gem,
  "lost-found": Search,
  other: Package,
}

const gradients: Record<string, string> = {
  "": "from-emerald-400 to-emerald-600",
  cars: "from-blue-400 to-blue-600",
  "car-parts": "from-slate-400 to-slate-600",
  motorcycles: "from-orange-400 to-orange-600",
  "motorcycle-parts": "from-amber-400 to-amber-600",
  maintenance: "from-yellow-500 to-orange-600",
  "real-estate-sale": "from-emerald-400 to-teal-600",
  "real-estate-rent": "from-teal-400 to-cyan-600",
  mobiles: "from-indigo-400 to-indigo-600",
  electronics: "from-cyan-400 to-sky-600",
  furniture: "from-rose-400 to-rose-600",
  fashion: "from-pink-400 to-fuchsia-600",
  pets: "from-lime-400 to-green-600",
  jobs: "from-violet-400 to-purple-600",
  services: "from-sky-400 to-blue-500",
  training: "from-amber-400 to-orange-500",
  games: "from-purple-400 to-violet-600",
  food: "from-red-400 to-rose-500",
  events: "from-fuchsia-400 to-pink-500",
  programming: "from-slate-500 to-gray-700",
  gardens: "from-green-400 to-emerald-600",
  arts: "from-pink-400 to-rose-500",
  tourism: "from-sky-400 to-blue-600",
  trips: "from-teal-400 to-cyan-600",
  antiques: "from-amber-500 to-yellow-600",
  "lost-found": "from-gray-400 to-slate-600",
  other: "from-gray-400 to-gray-600",
}

const barItems = [
  { slug: "", nameAr: "الرئيسية", nameEn: "Home" },
  { slug: "cars", nameAr: "سيارات", nameEn: "Cars" },
  { slug: "car-parts", nameAr: "قطع غيار", nameEn: "Parts" },
  { slug: "motorcycles", nameAr: "موتسيكلات", nameEn: "Bikes" },
  { slug: "motorcycle-parts", nameAr: "قطع موتسيكل", nameEn: "Bike parts" },
  { slug: "maintenance", nameAr: "مراكز صيانة", nameEn: "Maintenance" },
  { slug: "real-estate-sale", nameAr: "تمليك", nameEn: "Sale" },
  { slug: "real-estate-rent", nameAr: "إيجار", nameEn: "Rent" },
  { slug: "mobiles", nameAr: "موبايلات", nameEn: "Phones" },
  { slug: "electronics", nameAr: "أجهزة", nameEn: "Electronics" },
  { slug: "furniture", nameAr: "أثاث", nameEn: "Furniture" },
  { slug: "fashion", nameAr: "أزياء", nameEn: "Fashion" },
  { slug: "pets", nameAr: "حيوانات", nameEn: "Pets" },
  { slug: "jobs", nameAr: "وظائف", nameEn: "Jobs" },
  { slug: "services", nameAr: "خدمات", nameEn: "Services" },
  { slug: "training", nameAr: "تدريب", nameEn: "Training" },
  { slug: "games", nameAr: "ألعاب", nameEn: "Games" },
  { slug: "food", nameAr: "طعام", nameEn: "Food" },
  { slug: "events", nameAr: "مناسبات", nameEn: "Events" },
  { slug: "programming", nameAr: "برمجة", nameEn: "Code" },
  { slug: "gardens", nameAr: "حدائق", nameEn: "Gardens" },
  { slug: "arts", nameAr: "فنون", nameEn: "Arts" },
  { slug: "tourism", nameAr: "سياحة", nameEn: "Tourism" },
  { slug: "trips", nameAr: "رحلات", nameEn: "Trips" },
  { slug: "antiques", nameAr: "نوادر", nameEn: "Antiques" },
  { slug: "lost-found", nameAr: "مفقودات", nameEn: "Lost" },
  { slug: "other", nameAr: "أخرى", nameEn: "Other" },
]

export default function CategoryBar({ locale = "ar" }: Props) {
  const isRtl = locale === "ar"
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 200, behavior: "smooth" })
  }

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[72px] z-40">
      <div className="max-w-7xl mx-auto px-2 relative flex items-center gap-1">
        <button
          type="button"
          onClick={() => scroll(isRtl ? 1 : -1)}
          className="shrink-0 p-1.5 rounded-full bg-white shadow border text-gray-500 hover:bg-gray-50"
          aria-label="prev"
        >
          {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto py-3 scrollbar-hide scroll-smooth flex-1"
          style={{ scrollbarWidth: "none" }}
        >
          {barItems.map((c) => {
            const Icon = iconMap[c.slug] || Package
            const grad = gradients[c.slug] || "from-gray-400 to-gray-600"
            const href = c.slug ? `/${locale}/ads?category=${c.slug}` : `/${locale}`
            return (
              <Link
                key={c.slug || "home"}
                href={href}
                className="flex flex-col items-center gap-1 min-w-[64px] shrink-0 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition`}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-medium text-gray-600 text-center leading-tight max-w-[72px]">
                  {isRtl ? c.nameAr : c.nameEn}
                </span>
              </Link>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => scroll(isRtl ? -1 : 1)}
          className="shrink-0 p-1.5 rounded-full bg-white shadow border text-gray-500 hover:bg-gray-50"
          aria-label="next"
        >
          {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
