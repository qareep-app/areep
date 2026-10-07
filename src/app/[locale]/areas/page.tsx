import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"
import Link from "next/link"

type Props = { params: Promise<{ locale: string }> }

const areas = [
  "المعادي", "مدينة نصر", "مصر الجديدة", "الزمالك", "المهندسين", "الدقي",
  "شبرا", "العجوزة", "الشيخ زايد", "6 أكتوبر", "العاشر من رمضان",
  "سموحة", "سيدي جابر", "ميامي", "العجمي", "المنصورة", "طنطا",
]

export default async function AreasPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "الأحياء والمناطق" : "Areas"}>
      <Card>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <Link
              key={a}
              href={`/${locale}/ads?city=${encodeURIComponent(a)}`}
              className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm hover:border-emerald-400 hover:bg-emerald-50"
            >
              {a}
            </Link>
          ))}
        </div>
      </Card>
    </PolicyLayout>
  )
}
