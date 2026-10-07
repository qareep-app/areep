import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function SuspendedPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "الحسابات الموقوفة" : "Suspended accounts"}>
      <p className="text-center text-gray-600 mb-4 text-sm">
        {isRtl ? "ممكن يتم تقييد أو إيقاف الحساب في الحالات دي:" : "Accounts may be limited or suspended when:"}
      </p>
      <Card>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "عدم سداد عمولة الموقع المستحقة خلال 3 أيام من استحقاقها - يتم الإيقاف تلقائياً." : "Unpaid commission after 3 days."}</li>
          <li>{isRtl ? "نشر سلع أو عروض ممنوعة أو مخالفة للاتفاقية." : "Prohibited listings."}</li>
          <li>{isRtl ? "تقديم بيانات أو مستندات غير صحيحة." : "False documents."}</li>
          <li>{isRtl ? "تكرار الشكاوى الموثقة من مستخدمين آخرين، أو الاحتيال." : "Repeated valid complaints or fraud."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "رفع الإيقاف" : "Lifting suspension"}>
        <p>
          {isRtl
            ? "لو الإيقاف بسبب رصيد مستحق، يتم رفعه تلقائياً فور سداد المبلغ بالكامل. وفي الحالات التانية بتراجع الإدارة طلبك عبر صفحة «اتصل بنا»."
            : "Payment suspensions lift automatically after full settlement. Other cases require admin review via Contact."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
