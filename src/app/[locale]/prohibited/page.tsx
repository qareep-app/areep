import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function ProhibitedPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  const items = isRtl
    ? [
        "الأسلحة والذخائر والمتفجرات",
        "المخدرات والمواد المخدرة وأدوات تعاطيها",
        "الأدوية والمستحضرات الطبية اللي محتاجة ترخيص أو روشتة",
        "السلع المسروقة أو مجهولة المصدر",
        "المنتجات المقلّدة أو المغشوشة أو المنتهية الصلاحية",
        "الوثائق الرسمية والمستندات والأختام والبطاقات المزورة",
        "لوحات السيارات المعدنية وعدادات المسافة المعدّلة وقطع الغيار المسروقة",
        "الحيوانات والطيور المهددة بالانقراض أو المحمية قانوناً",
        "أعضاء وأنسجة بشرية",
        "المحتوى المخل بالآداب أو المسيء أو المحرّض على الكراهية",
        "أي سلعة أو خدمة يمنعها القانون المصري",
      ]
    : [
        "Weapons, ammunition, explosives",
        "Drugs and paraphernalia",
        "Prescription medicines without license",
        "Stolen or unknown-origin goods",
        "Counterfeit, fake, or expired products",
        "Forged official documents",
        "Stolen plates, odometer tampering, stolen parts",
        "Endangered animals",
        "Human organs/tissue",
        "Obscene or hate content",
        "Anything illegal under Egyptian law",
      ]

  return (
    <PolicyLayout locale={locale} title={isRtl ? "قائمة السلع والعروض الممنوعة" : "Prohibited items"}>
      <p className="text-center text-sm text-gray-600 mb-2">
        {isRtl
          ? "الإعلانات دي ممنوعة ويتم حذفها، وممكن يتم إيقاف الحساب المخالف:"
          : "These listings are removed; accounts may be suspended:"}
      </p>
      <Card>
        <ul className="list-disc pe-5 space-y-2">
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Card>
      <Card>
        <p>
          {isRtl
            ? "لو شفت إعلان مخالف، بلّغ عنه من خلال صفحة «اتصل بنا»."
            : "Report violations via Contact Us."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
