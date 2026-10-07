import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "عن قريب" : "About Areep"}>
      <p className="text-sm text-gray-600 text-center mb-4">
        {isRtl
          ? "قريب منصة مصرية بتوصّل الناس بالمحلات والبائعين القريبين منهم. بدأنا بقطع غيار السيارات والزيوت، وبتتوسّع تدريجياً لفئات تانية زي السيارات والعقارات والموبايلات والأجهزة والأثاث والملابس والوظائف والخدمات."
          : "Areep is an Egyptian local marketplace connecting people with nearby sellers."}
      </p>
      <Card title={isRtl ? "ليه قريب؟" : "Why Areep?"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "بائعون موثّقون بمستويات توثيق واضحة." : "Verified sellers."}</li>
          <li>{isRtl ? "سعر واحد شامل قدام المشتري، من غير رسوم مخفية." : "Clear pricing."}</li>
          <li>{isRtl ? "تواصل مباشر بين المشتري والبائع من خلال الرسائل داخل الموقع." : "In-app chat only."}</li>
          <li>{isRtl ? "دفع عند الاستلام أو أونلاين بالبطاقة (حسب توفّر الخدمة)." : "COD or online payment."}</li>
          <li>{isRtl ? "بحث بالمحافظة وبالأقرب ليك." : "Search by governorate and nearby."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "شعارنا" : "Our slogan"}>
        <p className="font-semibold text-emerald-800">
          {isRtl ? "دكانك قريب. أي حاجة وكل حاجة، من ناس وأماكن قريبة منك." : "Your shop is nearby."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
