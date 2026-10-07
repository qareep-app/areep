import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "كيف يعمل قريب؟" : "How Areep works"}>
      <Card title={isRtl ? "للمشتري" : "For buyers"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "دوّر بالبحث أو من الفئات، وفلتر بالمحافظة أو ماركة السيارة." : "Search and filter."}</li>
          <li>{isRtl ? "افتح المنتج وراسل البائع لو عندك أي سؤال (شات الموقع)." : "Open ad and chat."}</li>
          <li>{isRtl ? "أضف للسلة وأكمل الطلب، وادفع عند الاستلام أو أونلاين." : "Order and pay."}</li>
          <li>{isRtl ? "استلم طلبك وافحصه. ولو فيه مشكلة تواصل مع البائع أو مع الدعم." : "Receive and inspect."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "للبائع" : "For sellers"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "سجّل كبائع من صفحة «سجّل كبائع» وأكمل بياناتك ومستنداتك." : "Register and verify."}</li>
          <li>{isRtl ? "بعد موافقة الإدارة تقدر تضيف منتجاتك وتحدد سعرك ومصاريف الشحن." : "Post after approval."}</li>
          <li>{isRtl ? "استقبل الطلبات ورد على رسائل المشترين." : "Manage orders and chat."}</li>
          <li>{isRtl ? "سدّد عمولة الموقع في مواعيدها (اقرأ صفحة العمولة وسداد الرسوم)." : "Pay platform fees on time."}</li>
        </ul>
      </Card>
    </PolicyLayout>
  )
}
