import Link from "next/link"
import {
  Bike, Truck, Wrench, FileText, CarFront, Car,
  Phone, Hash,
} from "lucide-react"

interface Props {
  locale?: string
}

const vehicleSubs = [
  { slug: "motorcycles", labelAr: "دبابات", labelEn: "Bikes", icon: Bike },
  { slug: "trucks", labelAr: "شاحنات ومعدات", labelEn: "Trucks", icon: Truck },
  { slug: "car-parts", labelAr: "قطع غيار وملاكي", labelEn: "Parts", icon: Wrench },
  { slug: "export-cars", labelAr: "سيارات للتنازل", labelEn: "Export", icon: FileText },
  { slug: "damaged-cars", labelAr: "سيارات مصدومة", labelEn: "Damaged", icon: CarFront },
  { slug: "classic-cars", labelAr: "سيارات تراثية", labelEn: "Classic", icon: Car },
]

const techBrands = [
  { slug: "canon", label: "Canon", color: "#C8102E" },
  { slug: "samsung", label: "SAMSUNG", color: "#1428A0" },
  { slug: "apple", label: "Apple", color: "#555" },
  { slug: "nokia", label: "NOKIA", color: "#124191" },
  { slug: "microsoft", label: "MS", color: "#00A4EF" },
  { slug: "sony", label: "SONY", color: "#000" },
  { slug: "special-numbers", labelAr: "أرقام مميزة", labelEn: "Numbers", color: "#666" },
  { slug: "lg", label: "LG", color: "#A50034" },
]

export default function HomeSideFilters({ locale = "ar" }: Props) {
  const isRtl = locale === "ar"

  return (
    <div className="space-y-3 mt-3">
      {/* Vehicle subcategories */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3">
        <div className="grid grid-cols-3 gap-2">
          {vehicleSubs.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.slug}
                href={`/${locale}/ads?category=${s.slug}`}
                className="flex flex-col items-center gap-1.5 h-20 justify-center rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-300 hover:bg-white transition px-1"
              >
                <Icon size={26} className="text-gray-500" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-600 text-center leading-tight">
                  {isRtl ? s.labelAr : s.labelEn}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Tech / phones brands */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3">
        <div className="grid grid-cols-3 gap-2">
          {techBrands.map((b) => (
            <Link
              key={b.slug}
              href={
                b.slug === "special-numbers"
                  ? `/${locale}/ads?category=mobiles&tag=numbers`
                  : `/${locale}/ads?category=mobiles&brand=${b.slug}`
              }
              className="flex flex-col items-center justify-center h-20 rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-300 hover:bg-white transition px-1"
            >
              {b.slug === "special-numbers" ? (
                <>
                  <Hash size={22} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 mt-1">
                    {isRtl ? b.labelAr : b.labelEn}
                  </span>
                </>
              ) : b.slug === "microsoft" ? (
                <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
                  <div className="bg-[#F25022]" />
                  <div className="bg-[#7FBA00]" />
                  <div className="bg-[#00A4EF]" />
                  <div className="bg-[#FFB900]" />
                </div>
              ) : b.slug === "apple" ? (
                <span className="text-3xl text-gray-500"></span>
              ) : (
                <span
                  className="text-xs font-bold tracking-tight text-center"
                  style={{ color: b.color }}
                >
                  {b.label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
