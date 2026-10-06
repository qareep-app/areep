import Link from "next/link"
import {
  Car, Wrench, Bike, Settings, Building2, Smartphone,
  Tv, Sofa, Shirt, PawPrint, Briefcase, Package,
} from "lucide-react"

interface CategoryGridProps {
  locale?: string
}

const categories = [
  { slug: "cars", icon: Car, nameAr: "سيارات", nameEn: "Cars", color: "bg-blue-50 text-blue-600" },
  { slug: "car-parts", icon: Wrench, nameAr: "قطع غيار سيارات", nameEn: "Car Parts", color: "bg-slate-50 text-slate-600" },
  { slug: "motorcycles", icon: Bike, nameAr: "موتسيكلات وتروسيكلات", nameEn: "Motorcycles", color: "bg-orange-50 text-orange-600" },
  { slug: "motorcycle-parts", icon: Settings, nameAr: "قطع غيار موتسيكلات", nameEn: "Motorcycle Parts", color: "bg-amber-50 text-amber-600" },
  { slug: "real-estate-sale", icon: Building2, nameAr: "عقارات - تمليك", nameEn: "Real Estate Sale", color: "bg-emerald-50 text-emerald-600" },
  { slug: "real-estate-rent", icon: Building2, nameAr: "عقارات - إيجار", nameEn: "Real Estate Rent", color: "bg-teal-50 text-teal-600" },
  { slug: "mobiles", icon: Smartphone, nameAr: "موبايلات وتابلت", nameEn: "Mobiles", color: "bg-indigo-50 text-indigo-600" },
  { slug: "electronics", icon: Tv, nameAr: "أجهزة كهربائية", nameEn: "Appliances", color: "bg-cyan-50 text-cyan-600" },
  { slug: "furniture", icon: Sofa, nameAr: "أثاث ومفروشات", nameEn: "Furniture", color: "bg-rose-50 text-rose-600" },
  { slug: "fashion", icon: Shirt, nameAr: "ملابس وأحذية", nameEn: "Fashion", color: "bg-pink-50 text-pink-600" },
  { slug: "pets", icon: PawPrint, nameAr: "حيوانات أليفة", nameEn: "Pets", color: "bg-lime-50 text-lime-600" },
  { slug: "jobs", icon: Briefcase, nameAr: "وظائف وخدمات", nameEn: "Jobs", color: "bg-violet-50 text-violet-600" },
  { slug: "other", icon: Package, nameAr: "أخرى", nameEn: "Other", color: "bg-gray-50 text-gray-600" },
]

export default function CategoryGrid({ locale = "ar" }: CategoryGridProps) {
  const isRtl = locale === "ar"

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isRtl ? "تصفح الفئات" : "Browse Categories"}
          </h2>
          <Link href={`/${locale}/categories`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            {isRtl ? "الكل ←" : "See all →"}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.slug}
                href={`/${locale}/ads?category=${cat.slug}`}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition text-center"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center`}>
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
