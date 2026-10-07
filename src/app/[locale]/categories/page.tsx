import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"
import Link from "next/link"

type Props = { params: Promise<{ locale: string }> }

const cats = [
  { slug: "cars", ar: "سيارات" },
  { slug: "car-parts", ar: "قطع غيار" },
  { slug: "motorcycles", ar: "موتسيكلات" },
  { slug: "real-estate-sale", ar: "عقارات تمليك" },
  { slug: "real-estate-rent", ar: "عقارات إيجار" },
  { slug: "mobiles", ar: "موبايلات" },
  { slug: "electronics", ar: "أجهزة" },
  { slug: "furniture", ar: "أثاث" },
  { slug: "fashion", ar: "أزياء" },
  { slug: "jobs", ar: "وظائف" },
  { slug: "services", ar: "خدمات" },
]

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "التصنيفات" : "Categories"}>
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/${locale}/ads?category=${c.slug}`}
              className="px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 text-center text-sm font-medium hover:border-emerald-300 hover:bg-emerald-50"
            >
              {c.ar}
            </Link>
          ))}
        </div>
      </Card>
    </PolicyLayout>
  )
}
