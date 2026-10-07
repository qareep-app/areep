import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function DiscountsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "نظام الخصم" : "Discounts"}>
      <Card>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "البائع يقدر يحدد نسبة خصم على منتجاته، والإدارة ممكن تعدّلها." : "Sellers set discounts; admin may adjust."}</li>
          <li>{isRtl ? "المنتجات المخفّضة بتظهر في قسم «عروض وخصومات» في الصفحة الرئيسية." : "Discounted items appear in Offers."}</li>
          <li>{isRtl ? "السعر بعد الخصم هو اللي بيدخل في حساب الطلب وعمولة الموقع." : "Price after discount is used for commission."}</li>
          <li>{isRtl ? "الخصم لازم يكون حقيقي، وأي إعلان بيعرض خصم وهمي بيتخذف." : "Fake discounts are removed."}</li>
        </ul>
      </Card>
    </PolicyLayout>
  )
}
