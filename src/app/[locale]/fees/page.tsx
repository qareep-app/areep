import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function FeesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <PolicyLayout locale={locale} title={isRtl ? "العمولة وسداد رسوم الموقع" : "Fees & Commission"}>
      <Card title={isRtl ? "عمولة البائع" : "Seller commission"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            {isRtl
              ? "نسبة موحّدة 2% من قيمة كل عملية بيع، سواء تمت من خلال الموقع أو تم التعارف عليه من خلاله واتفق الطرفان على إتمامها برا الموقع (زي بيع السيارات)."
              : "Flat 2% of every sale value, whether completed on the platform or offline after meeting through Areep."}
          </li>
          <li>
            {isRtl
              ? "أول 100 بائع يتم اعتماد حسابهم على المنصة («البائعين المؤسسين») نسبة العمولة عليهم 1% بس (بدل 2%) مدى الحياة."
              : "First 100 verified sellers (founders) pay only 1% for life instead of 2%."}
          </li>
          <li>
            {isRtl
              ? "مستوى التوثيق (أساسي / موثّق) بيتحكم في سقف قيمة الطلب بس، وملوش تأثير على نسبة العمولة."
              : "Verification level only affects order value caps, not the commission rate."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "المشتري" : "Buyer"}>
        <p>
          {isRtl
            ? "المشتري بيشوف سعر واحد شامل. وحالياً مفيش أي رسوم إضافية على المشتري (إلا في حالة تفعيل نظام وسيط قريب على السيارات والعقارات حسب سياسة الوسيط)."
            : "Buyers see one inclusive price. No extra buyer fees by default (except with Areep Escrow on cars/real estate)."}
        </p>
      </Card>

      <Card title={isRtl ? "البيع اللي بيتم برا الموقع" : "Off-platform sales"}>
        <p>
          {isRtl
            ? "لو بائع باع منتج (زي عربية) لمشتري تعرّف عليه من خلال دكان قريب، وتم الاتفاق على إتمام البيع برا الموقع، البائع لازم يبلّغ عن البيع من لوحة البائع بزرار «تم البيع» ويحدد سعر البيع. يتم احتساب نفس نسبة العمولة على السعر المبلّغ عنه، وبتضاف لرصيده المستحق للموقع."
            : "If a sale happens offline after meeting via Areep, the seller must mark it sold and report the price; the same commission applies."}
        </p>
      </Card>

      <Card title={isRtl ? "السداد" : "Payment"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            {isRtl
              ? "العمولة المستحقة (من طلبات الموقع أو من بيع تم التبليغ عنه) بتسجّل في رصيد البائع."
              : "Due commission is recorded on the seller balance."}
          </li>
          <li>
            {isRtl
              ? "على البائع سداد الرصيد المستحق للموقع في المواعيد اللي بتوضحها لوحة البائع."
              : "Sellers must settle the balance by the dates shown in their dashboard."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "التأخر في السداد" : "Late payment"}>
        <p>
          {isRtl
            ? "لو الرصيد المستحق ماتسددش خلال 3 أيام من استحقاقه، يتم إيقاف حساب البائع تلقائياً (منع إضافة إعلانات جديدة) لحد ما يسدد المستحق بالكامل، وبعدها بيرجع الحساب يشتغل تلقائياً (اقرأ صفحة «الحسابات الموقوفة»)."
            : "If unpaid within 3 days of due date, the seller account is suspended until full payment."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
