import PayButton from "@/components/payments/PayButton"
import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"
import Link from "next/link"

type Props = { params: Promise<{ locale: string }> }

export default async function EscrowPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <PolicyLayout
      locale={locale}
      title={isRtl ? "سياسة وسيط قريب" : "Areep Escrow Policy"}
    >
      <p className="text-center text-sm text-gray-600 mb-2">
        {isRtl
          ? "وسيط قريب خدمة اختيارية بتحمي البائع والمشتري: الفلوس بتتحجز عند المنصة لحد ما يتم التسليم أو الاستلام حسب الاتفاق."
          : "Areep Escrow is optional protection: funds are held by the platform until delivery is confirmed."}
      </p>

      <Card title={isRtl ? "1. إيه هي خدمة وسيط قريب؟" : "1. What is Areep Escrow?"}>
        <p>
          {isRtl
            ? "نظام وسيط (Escrow) بيجمع فلوس المشتري في حساب المنصة، ومش بيتسلّم للبائع غير بعد ما الطرفين يأكدوا إتمام الصفقة (أو حسب قواعد الفئة). الهدف تقليل النصب وحماية الطرفين في الصفقات الكبيرة زي السيارات والعقارات."
            : "Escrow holds the buyer's payment until both parties confirm the deal is complete—especially for cars and real estate."}
        </p>
      </Card>

      <Card title={isRtl ? "2. الفئات المتاحة" : "2. Eligible categories"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            {isRtl
              ? "السيارات وقطع غيار السيارات المستعملة (اختياري من البائع)."
              : "Cars and used car parts (seller optional)."}
          </li>
          <li>
            {isRtl
              ? "العقارات تمليك وإيجار (مع إمكانية ربط مستشار قانوني معتمد للمنصة)."
              : "Real estate sale/rent (optional licensed legal advisor)."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "3. العمولات عند استخدام الوسيط" : "3. Fees with Escrow"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            <strong>{isRtl ? "السيارات / قطع الغيار: " : "Cars / parts: "}</strong>
            {isRtl
              ? "2.5% من البائع + 2.5% من المشتري على قيمة الصفقة."
              : "2.5% from seller + 2.5% from buyer."}
          </li>
          <li>
            <strong>{isRtl ? "العقارات – تمليك: " : "Real estate – sale: "}</strong>
            {isRtl
              ? "2.5% من البائع + 2.5% من المشتري. نصف عمولة المنصة يُحوَّل لمكتب المستشار القانوني المعتمد بعد إتمام التسليم."
              : "2.5% each side; half of platform commission goes to the certified legal advisor after completion."}
          </li>
          <li>
            <strong>{isRtl ? "العقارات – إيجار: " : "Real estate – rent: "}</strong>
            {isRtl
              ? "نصف شهر إيجار من المؤجر + نصف شهر من المستأجر (إجمالي شهر واحد يُقسَّم بين المنصة والمستشار حسب الاتفاق)."
              : "Half a month from landlord + half from tenant."}
          </li>
          <li>
            {isRtl
              ? "من غير وسيط: العمولة الأساسية 2% على البائع فقط (حسب سياسة العمولة العامة)."
              : "Without escrow: base 2% on the seller only."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "4. خطوات الصفقة (سيناريو عام)" : "4. Deal steps"}>
        <ol className="list-decimal pe-5 space-y-2">
          <li>
            {isRtl
              ? "البائع يفعّل «وسيط قريب» على الإعلان."
              : "Seller enables Areep Escrow on the listing."}
          </li>
          <li>
            {isRtl
              ? "المشتري يطلب الصفقة من داخل الموقع (شات داخلي فقط)."
              : "Buyer requests the deal inside the platform chat only."}
          </li>
          <li>
            {isRtl
              ? "المشتري يدفع قيمة الصفقة + حصته من العمولة عبر بوابات الدفع المعتمدة (Paymob وغيرها)."
              : "Buyer pays deal value + their commission share via supported gateways."}
          </li>
          <li>
            {isRtl
              ? "المبلغ يتحجز في حساب المنصة (حالة: محجوز)."
              : "Funds held by the platform (status: held)."}
          </li>
          <li>
            {isRtl
              ? "التسليم/المعاينة حسب الاتفاق (ومع العقارات: توقيع إلكتروني + OTP ومستشار قانوني عند الحاجة)."
              : "Delivery/inspection as agreed (real estate: e-signature + OTP + legal advisor when needed)."}
          </li>
          <li>
            {isRtl
              ? "بعد تأكيد الطرفين (أو انتهاء مهلة الاعتراض)، المنصة تخصم عمولتها وتُحوِّل صافي المبلغ للبائع."
              : "After both confirm (or objection window ends), platform deducts fees and releases net to seller."}
          </li>
        </ol>
      </Card>

      <Card title={isRtl ? "5. الإلغاء والنزاعات" : "5. Cancellation & disputes"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            {isRtl
              ? "قبل الدفع: أي طرف يقدر يلغي من غير رسوم وسيط."
              : "Before payment: either party may cancel with no escrow fee."}
          </li>
          <li>
            {isRtl
              ? "بعد الدفع وقبل التسليم: الإلغاء باتفاق الطرفين أو بقرار المنصة بعد مراجعة الأدلة (محادثات الموقع، صور، معاينة)."
              : "After payment and before delivery: mutual agreement or platform decision after review."}
          </li>
          <li>
            {isRtl
              ? "في حالة النزاع، المنصة بتحتفظ بالمبلغ لحد البتّ، ومش بتحوّل لأي طرف من غير أساس."
              : "In disputes, funds stay held until resolution."}
          </li>
          <li>
            {isRtl
              ? "التواصل بخصوص الصفقة لازم يفضل داخل شات الموقع فقط (حسب اتفاقية الاستخدام ومركز الأمان)."
              : "All deal communication must stay in-platform chat."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "6. المسؤولية" : "6. Liability"}>
        <p>
          {isRtl
            ? "وسيط قريب بيحمي مسار الدفع والتسليم حسب القواعد دي، لكنه مش بديل عن فحص السلعة أو الاستشارة القانونية المستقلة. المنصة مش ضامنة جودة المنتج، لكنها ضامنة إن الفلوس متحجزش أو تتسلّمش إلا حسب السياسة."
            : "Escrow secures payment flow; it does not replace product inspection or independent legal advice."}
        </p>
      </Card>

      <Card>
        <p className="text-sm">
          {isRtl ? "صفحات مرتبطة: " : "Related: "}
          <Link href={`/${locale}/fees`} className="text-emerald-600 underline">
            {isRtl ? "العمولة وسداد الرسوم" : "Fees"}
          </Link>
          {" · "}
          <Link href={`/${locale}/safety`} className="text-emerald-600 underline">
            {isRtl ? "مركز الأمان" : "Safety"}
          </Link>
          {" · "}
          <Link href={`/${locale}/terms`} className="text-emerald-600 underline">
            {isRtl ? "اتفاقية الاستخدام" : "Terms"}
          </Link>
        </p>
      </Card>
    
      <Card title="دفع عبر Paymob">
        <p className="text-sm mb-3">تجربة دفع وسيط / عمولة — يحتاج مفاتيح Paymob على Vercel.</p>
        <div className="flex flex-wrap gap-3">
          <PayButton locale={locale} type="escrow" amount={1000} referenceId="demo-escrow" label="دفع وسيط تجريبي 1000 ج" />
          <PayButton locale={locale} type="commission" amount={50} referenceId="demo-commission" label="دفع عمولة 50 ج" />
        </div>
      </Card>
    </PolicyLayout>
  )
}
