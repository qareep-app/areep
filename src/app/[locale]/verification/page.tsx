import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function VerificationPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <PolicyLayout locale={locale} title={isRtl ? "توثيق المتجر" : "Store verification"}>
      <Card title={isRtl ? "المستويات" : "Levels"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>
            {isRtl
              ? "أساسي: بتوثّق بصورة بطاقة الرقم القومي (وش وظهر)، وسقف 25,000 جنيه للطلب."
              : "Basic: national ID photo; order cap 25,000 EGP."}
          </li>
          <li>
            {isRtl
              ? "موثّق: بتوثّق بصورة السجل التجاري، وبدون سقف للطلب."
              : "Verified: commercial register; no order cap."}
          </li>
          <li>
            {isRtl
              ? "نسبة العمولة (2%، أو 1% للبائعين المؤسسين) واحدة في المستويين، ومش بتختلف حسب التوثيق."
              : "Commission rate is the same at both levels."}
          </li>
        </ul>
      </Card>
      <Card title={isRtl ? "الخطوات" : "Steps"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "سجّل من صفحة «سجّل كبائع» وأكمل التحقق." : "Register as seller and verify."}</li>
          <li>{isRtl ? "اختار مستوى التوثيق، وارفع المستندات المطلوبة." : "Choose level and upload documents."}</li>
          <li>{isRtl ? "أدخل عنوانك وراجع بياناتك وأرسل الطلب." : "Enter address, review, submit."}</li>
          <li>{isRtl ? "الإدارة بتراجع طلبك، وبتوصلك النتيجة بالموافقة أو الرفض." : "Admin reviews and notifies you."}</li>
        </ul>
      </Card>
      <Card>
        <p>
          {isRtl
            ? "الأوراق المرفوعة بتستخدم لأغراض التحقق فقط، وبتتحفظ حسب سياسة الخصوصية."
            : "Documents are used for verification only, stored per privacy policy."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
