import { ShieldCheck, MapPin, BadgePercent } from "lucide-react"

interface FeaturesProps {
  locale?: string
}

export default function Features({ locale = "ar" }: FeaturesProps) {
  const isRtl = locale === "ar"

  const features = [
    {
      icon: ShieldCheck,
      titleAr: "آمن وموثوق",
      titleEn: "Safe & Trusted",
      descAr: "تواصل مباشر مع البائعين وقرر براحتك",
      descEn: "Chat directly with sellers and decide freely",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: MapPin,
      titleAr: "قريب منك",
      titleEn: "Near You",
      descAr: "تصفح الإعلانات في حيك والمدن القريبة",
      descEn: "Browse ads in your neighborhood and nearby cities",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: BadgePercent,
      titleAr: "بدون تكاليف عالية",
      titleEn: "No High Costs",
      descAr: "توفير في الشحن والمواصلات واربح أكثر",
      descEn: "Save on shipping and transport, earn more",
      color: "bg-blue-100 text-blue-600",
    },
  ]

  return (
    <section className="py-12 bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div className={`w-14 h-14 rounded-full ${f.color} flex items-center justify-center mb-4`}>
                  <Icon size={28} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {isRtl ? f.titleAr : f.titleEn}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {isRtl ? f.descAr : f.descEn}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
