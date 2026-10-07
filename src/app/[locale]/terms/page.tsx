import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "اتفاقية الاستخدام" : "Terms of Use"}>
      <p className="text-sm text-gray-600 text-center mb-2">
        {isRtl
          ? "باستخدامك لقريب فإنك بتوافق على الشروط دي. لو مش موافق عليها، من فضلك متستخدمش الموقع."
          : "By using Areep you agree to these terms."}
      </p>
      <Card title={isRtl ? "1. طبيعة الموقع" : "1. Nature of the service"}>
        <p>
          {isRtl
            ? "قريب منصة وسيطة بتجمع بين البائعين والمشترين. البيع والشراء بيتم بين المستخدمين. والبائع هو المسؤول عن صحة بيانات منتجه وجودته وسعره وتسليمه."
            : "Areep is a marketplace intermediary. Sellers are responsible for their listings and delivery."}
        </p>
      </Card>
      <Card title={isRtl ? "2. الحساب" : "2. Account"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "لازم تكون بياناتك صحيحة، وتحافظ على سرية كلمة السر وأكواد التحقق." : "Accurate data; keep credentials secret."}</li>
          <li>{isRtl ? "أنت مسؤول عن كل نشاط بيتم من خلال حسابك." : "You are responsible for account activity."}</li>
          <li>{isRtl ? "يجوز لنا رفض أو إيقاف أي حساب يخالف الشروط." : "We may suspend accounts that break the rules."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "3. الإعلانات والمنتجات" : "3. Listings"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "لازم يكون الوصف والصور والسعر حقيقيين ومطابقين للمنتج." : "Honest description, photos, and price."}</li>
          <li>{isRtl ? "ممنوع نشر أي سلعة أو خدمة واردة في «قائمة السلع والعروض الممنوعة»." : "No prohibited items."}</li>
          <li>{isRtl ? "يحق للإدارة حذف أو تعديل أي إعلان مخالف من غير إخطار مسبق." : "We may remove violating ads."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "4. التواصل داخل الموقع فقط" : "4. In-app chat only"}>
        <p>
          {isRtl
            ? "لحماية حقوق البائع والمشتري، التواصل بخصوص أي إعلان لازم يتم من خلال نظام الرسائل في الموقع، وممنوع تبادل أرقام تليفونات أو وسائل تواصل تانية في المحادثة. مخالفة القاعدة دي بتأدّي لتجميد الحساب مؤقتاً، وتكرارها بيأدّي لإغلاق الحساب نهائياً. التفاصيل في صفحة «مركز الأمان»."
            : "All deal communication must stay in Areep chat. Sharing phone numbers may freeze or close the account."}
        </p>
      </Card>
      <Card title={isRtl ? "5. الأسعار والعمولة" : "5. Prices & commission"}>
        <p>
          {isRtl
            ? "الأسعار بالجنيه المصري. بيدفع البائع عمولة موحّدة للموقع عن كل عملية بيع (جوه الموقع أو تم التعارف عليها من خلاله)، والتفاصيل في صفحة «العمولة وسداد الرسوم»."
            : "Prices in EGP. Sellers pay platform commission per sale; see Fees page."}
        </p>
      </Card>
      <Card title={isRtl ? "6. المسؤولية" : "6. Liability"}>
        <p>
          {isRtl
            ? "نبذل جهدنا إن الموقع يشتغل بشكل سليم، لكن مش بنضمن إنه يكون خالي من الأعطال أو الانقطاع. مش مسؤولين عن أي خسائر ناتجة عن تعامل بين المستخدمين برا نطاق الموقع."
            : "We aim for reliable service but are not liable for off-platform user deals."}
        </p>
      </Card>
      <Card title={isRtl ? "7. التعديل والقانون الواجب التطبيق" : "7. Changes & law"}>
        <p>
          {isRtl
            ? "ممكن نعدّل الشروط دي في أي وقت، واستمرارك في الاستخدام بعد التعديل معناه موافقتك عليه. تخضع هذه الاتفاقية للقوانين السارية في جمهورية مصر العربية."
            : "Terms may change; continued use means acceptance. Egyptian law applies."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
