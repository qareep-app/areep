"use client"

import Link from "next/link"
import {
  Car, Wrench, Bike, Settings, Building2, Smartphone,
  Tv, Sofa, Shirt, PawPrint, Briefcase, Package, HandHelping, HardHat,
} from "lucide-react"
import { AREEP_CATEGORIES } from "@/lib/categories"

interface CategoryGridProps {
  locale?: string
}

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
  other: Package,
}

export default function CategoryGrid({ locale = "ar" }: CategoryGridProps) {
  const isRtl = locale === "ar"
  // show primary set first
  const primary = AREEP_CATEGORIES.filter((c) =>
    [
      "cars",
      "car-parts",
      "motorcycles",
      "motorcycle-parts",
      "maintenance",
      "real-estate-sale",
      "real-estate-rent",
      "mobiles",
      "electronics",
      "furniture",
      "fashion",
      "jobs",
    ].includes(c.slug)
  )

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isRtl ? "تصفح الفئات" : "Browse Categories"}
          </h2>
          <Link href={`/${locale}/categories`} className="text-sm font-medium text-emerald-600">
            {isRtl ? "الكل ←" : "See all →"}
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {primary.map((cat) => {
            const Icon = iconMap[cat.slug] || Package
            return (
              <Link
                key={cat.slug}
                href={`/${locale}/ads?category=${cat.slug}`}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Icon size={22} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
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
