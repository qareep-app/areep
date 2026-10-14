import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function EscrowPolicyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <PolicyLayout
      locale={locale}
      title={isRtl ? "سياسة وسيط قريب" : "Areep Escrow Policy"}
    >
      <p className="text-sm text-gray-600 text-center mb-2">
        {isRtl
          ? "وسيط قريب خدمة اختيارية لحماية البائع والمشتري في الصفقات الحساسة (سيارات، عقارات، …)."
          : "Optional protection for high-value deals (cars, real estate, etc.)."}
      </p>

      <Card title={isRtl ? "1. اختيارية الخدمة" : "1. Optional"}>
        <p>
          {isRtl
            ? "البائع يفعّل «وسيط قريب» على الإعلان. المشتري يختار الشراء بوسيط أو بالتواصل العادي داخل الموقع. مفيش إجبار."
            : "Seller enables escrow on the ad; buyer chooses escrow or normal chat. Never mandatory."}
        </p>
      </Card>

      <Card title={isRtl ? "2. مسار الصفقة" : "2. Flow"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            {isRtl
              ? "اتفاق داخل الشات على السعر والتفاصيل."
              : "Agree on price in internal chat."}
          </li>
          <li>
            {isRtl
              ? "دفع المشتري عبر بوابة الدفع المعتمدة (Paymob بعد الاعتماد) لحساب الضمان."
              : "Buyer pays via approved gateway into escrow."}
          </li>
          <li>
            {isRtl
              ? "بعد تأكيد الاستلام من الطرفين (أو وفق قواعد القسم) يُحوَّل المبلغ للبائع مخصومًا منه عمولة المنصة."
              : "After delivery confirmation, funds go to seller minus platform fee."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "3. العمولات" : "3. Fees"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            {isRtl
              ? "عمولة عامة 2% على البيعة (حسب سياسة الأقسام)."
              : "Base 2% commission (category rules apply)."}
          </li>
          <li>
            {isRtl
              ? "السيارات / قطع الغيار / العقارات: نسب خاصة عند تفعيل الوسيط (مذكورة في صفحة العمولات)."
              : "Cars/parts/real estate have specific escrow rates."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "4. النزاعات" : "4. Disputes"}>
        <p>
          {isRtl
            ? "في حال النزاع، فريق قريب يراجع المحادثة والمستندات. القرار الإداري نهائي ضمن حدود القانون المصري. التواصل بأرقام خارج الموقع ممنوع ويُوقف الحساب."
            : "Disputes reviewed by Areep from chat/docs. Off-platform contact is forbidden."}
        </p>
      </Card>

      <Card title={isRtl ? "5. الدفع" : "5. Payments"}>
        <p>
          {isRtl
            ? "حتى اعتماد Paymob نهائيًا، قد تعمل البوابات في وضع اختبار. التحويل البنكي الفعلي للبائع يتم وفق تسوية معتمدة بعد الإطلاق الكامل."
            : "Until Paymob is fully live, test mode may apply. Seller payouts follow approved settlement after full launch."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
