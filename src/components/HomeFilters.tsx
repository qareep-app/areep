import Link from "next/link"
import { MapPin, Navigation, Sparkles } from "lucide-react"

interface Props {
  locale?: string
}

export default function HomeFilters({ locale = "ar" }: Props) {
  const isRtl = locale === "ar"

  const filters = [
    {
      href: `/${locale}/areas`,
      icon: MapPin,
      labelAr: "المنطقة",
      labelEn: "Region",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      href: `/${locale}/nearby`,
      icon: Navigation,
      labelAr: "القريب",
      labelEn: "Nearby",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      href: `/${locale}/ads?sort=new`,
      icon: Sparkles,
      labelAr: "جديد",
      labelEn: "New",
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      {filters.map((f) => {
        const Icon = f.icon
        return (
          <Link
            key={f.href}
            href={f.href}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition hover:shadow-sm ${f.color}`}
          >
            <Icon size={15} />
            {isRtl ? f.labelAr : f.labelEn}
          </Link>
        )
      })}
    </div>
  )
}
