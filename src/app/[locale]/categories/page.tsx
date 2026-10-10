import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import Link from "next/link"
import {
  Car, Wrench, Bike, Settings, Building2, Smartphone,
  Tv, Sofa, Shirt, PawPrint, Briefcase, Package,
  HandHelping, GraduationCap, Gamepad2, UtensilsCrossed,
  PartyPopper, Code2, Trees, Palette, Plane, Map, Gem, Search, HardHat,
} from "lucide-react"
import { AREEP_CATEGORIES } from "@/lib/categories"

type Props = { params: Promise<{ locale: string }> }

const iconMap: Record<string, any> = {
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

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {isRtl ? "التصنيفات" : "Categories"}
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {AREEP_CATEGORIES.map((c) => {
            const Icon = iconMap[c.slug] || Package
            return (
              <Link
                key={c.slug}
                href={`/${locale}/ads?category=${c.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-white hover:border-emerald-300 hover:shadow-sm transition text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Icon size={22} />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {isRtl ? c.nameAr : c.nameEn}
                </span>
              </Link>
            )
          })}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
