import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function SafetyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "مركز الأمان" : "Safety Center"}>
      <p className="text-center text-gray-600 text-sm mb-2">
        {isRtl ? "نصايح بسيطة تحميك من النصب وتخلّي تعاملك آمن:" : "Simple tips for safer deals:"}
      </p>
      <Card title={isRtl ? "التواصل من خلال الموقع بس" : "Chat only on the platform"}>
        <p>
          {isRtl
            ? "من فضلك كُل أي تواصل بخصوص الشراء أو البيع من خلال رسائل الموقع، وماتشاركش رقم تليفونك أو أي وسيلة تواصل تانية في المحادثة. ده بيحمي حقك وحق الطرف التاني، وممنوع في كل الفئات من غير استثناء. محاولات تكرار مشاركة الأرقام بتأدّي لتجميد الحساب."
            : "Keep all deal chat inside Areep. Sharing phone numbers is forbidden and may freeze the account."}
        </p>
      </Card>
      <Card title={isRtl ? "للمشتري" : "For buyers"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "افحص المنتج كويس قبل الدفع، وخصوصاً السيارات وقطع الغيار والأجهزة." : "Inspect before paying."}</li>
          <li>{isRtl ? "متحوّلش فلوس مقدماً لشخص متعرفوش." : "Don't send money upfront to strangers."}</li>
          <li>{isRtl ? "قابل البائع في مكان عام ومزدحم لو الاستلام بنفسك." : "Meet in public places."}</li>
          <li>{isRtl ? "احتفظ بالمحادثات واستخدم رسائل الموقع في التواصل." : "Keep chat history on the platform."}</li>
          <li>{isRtl ? "لو السعر أقل بكثير من السوق، خُد بالك: ممكن يكون نصب." : "Prices far below market may be scams."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "وسيط قريب" : "Areep Escrow"}>
        <p>
          {isRtl
            ? "للصفقات الكبيرة (سيارات وعقارات) استخدم «وسيط قريب» عشان الفلوس تتحجز عند المنصة لحد التسليم. التفاصيل في صفحة سياسة وسيط قريب."
            : "For large deals (cars, real estate) use Areep Escrow so funds are held until delivery."}
        </p>
        <p className="mt-2">
          <a href={`/${locale}/escrow`} className="text-emerald-600 font-medium underline">
            {isRtl ? "اقرأ سياسة وسيط قريب" : "Read Escrow policy"}
          </a>
        </p>
      </Card>

      <Card title={isRtl ? "للجميع" : "For everyone"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "متشاركش كود التحقق (OTP) أو كلمة السر مع أي حد، ولا حتى مع اللي بيقول إنه من الدعم." : "Never share OTP or passwords."}</li>
          <li>{isRtl ? "الموقع مش هيطلب منك بيانات بطاقتك في رسالة أو مكالمة." : "We never ask for card details by message/call."}</li>
          <li>{isRtl ? "بلّغ عن أي حساب أو إعلان مشبوه فوراً." : "Report suspicious accounts/ads immediately."}</li>
        </ul>
      </Card>
    </PolicyLayout>
  )
}
