import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  const items = isRtl
    ? [
        { q: "إزاي أشتري؟", a: "دوّر على المنتج، افتحه، تقدر تراسل البائع قبل الشراء من صفحة المنتج عبر شات الموقع." },
        { q: "طرق الدفع إيه؟", a: "الدفع عند الاستلام متاح، والدفع أونلاين بالبطاقة متاح حسب توفّر الخدمة (Paymob)." },
        { q: "الشحن بكام؟", a: "مصاريف الشحن بيحددها البائع لكل منتج وبتظهر لك بوضوح في صفحة المنتج." },
        { q: "إزاي أبيع على قريب؟", a: "سجّل كبائع، ارفع مستنداتك، وبعد موافقة الإدارة أضف منتجاتك." },
        { q: "لقيت إعلان مخالف أو نصب، أعمل إيه؟", a: "بلّغنا فوراً من صفحة «اتصل بنا»، واقرأ نصايح «مركز الأمان»." },
      ]
    : [
        { q: "How do I buy?", a: "Browse, open the ad, chat with the seller inside the platform." },
        { q: "Payment methods?", a: "Cash on delivery and online cards via Paymob when available." },
        { q: "Shipping cost?", a: "Set by the seller and shown on the ad page." },
        { q: "How do I sell?", a: "Register as seller, verify, then post after approval." },
        { q: "Scam listing?", a: "Report via Contact Us and read Safety Center tips." },
      ]

  return (
    <PolicyLayout locale={locale} title={isRtl ? "الأسئلة الشائعة" : "FAQ"}>
      {items.map((item, i) => (
        <Card key={i} title={item.q}>
          <p>{item.a}</p>
        </Card>
      ))}
    </PolicyLayout>
  )
}
