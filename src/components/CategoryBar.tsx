import Link from "next/link"
import {
  Car, Wrench, Bike, Settings, Building2, Smartphone,
  Tv, Sofa, Shirt, PawPrint, Briefcase, Package, Home,
  HandHelping, GraduationCap, Gamepad2, UtensilsCrossed,
  PartyPopper, Code2, Trees, Palette, Plane, Map,
  Gem, Search,
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
  // extra categories before "other"
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

  return (
    <section className="bg-white border-b border-gray-100 sticky top-[7.5rem] z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon
            const href = cat.slug ? `/${locale}/ads?category=${cat.slug}` : `/${locale}`
            return (
              <Link
                key={cat.slug || "home"}
                href={href}
                className="flex flex-col items-center gap-1.5 min-w-[72px] px-2 py-1 rounded-xl hover:bg-gray-50 transition shrink-0"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white`}
                  style={{
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.12), inset 0 1px 0 rgb(255 255 255 / 0.25)",
                  }}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap">
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
