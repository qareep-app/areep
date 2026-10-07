import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "سياسة الخصوصية" : "Privacy Policy"}>
      <p className="text-sm text-gray-600 text-center mb-2">
        {isRtl
          ? "خصوصيتك مهمة لينا. الصفحة دي بتوضح إيه اللي بنجمعه وليه وإزاي بنحميه."
          : "What we collect, why, and how we protect it."}
      </p>
      <Card title={isRtl ? "البيانات اللي بنجمعها" : "Data we collect"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "بيانات الحساب: الاسم والبريد الإلكتروني ورقم الهاتف." : "Account: name, email, phone."}</li>
          <li>{isRtl ? "بيانات البائعين: العنوان ومستندات التوثيق (بطاقة الرقم القومي أو السجل التجاري)." : "Seller docs for verification."}</li>
          <li>{isRtl ? "بيانات الطلبات والرسائل بين المشتري والبائع." : "Orders and in-app messages."}</li>
          <li>{isRtl ? "موقعك التقريبي لو ضغطت على «القريب» وسمحت للمتصفح بتحديد الموقع، وبنستخدمه لاختيار المحافظة فقط." : "Approximate location only if you allow Nearby."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "استخدام البيانات" : "How we use data"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "تنفيذ الطلبات والتواصل بين الأطراف." : "Orders and user communication."}</li>
          <li>{isRtl ? "التحقق من هوية البائعين ومنع الاحتيال." : "Seller verification and anti-fraud."}</li>
          <li>{isRtl ? "تحسين الخدمة وإرسال الإشعارات المتعلقة بحسابك." : "Service improvement and account notices."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "المشاركة والحماية" : "Sharing & protection"}>
        <p>
          {isRtl
            ? "منبيعش بياناتك لأي جهة. بنشارك أقل قدر لازم مع مزودي الخدمة (زي بوابة الدفع) عشان تتم العمليات، أو لو القانون طلب كده. بنستخدم إجراءات تقنية لحماية بياناتك، ومع ذلك مفيش نظام آمن بنسبة 100%."
            : "We don't sell data. Minimal sharing with processors (e.g. payments) or when required by law."}
        </p>
      </Card>
      <Card title={isRtl ? "حقوقك" : "Your rights"}>
        <p>
          {isRtl
            ? "تقدر تطلب تعديل بياناتك أو حذف حسابك من خلال التواصل معنا عبر صفحة «اتصل بنا»."
            : "Request data changes or account deletion via Contact Us."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
