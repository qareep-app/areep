import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"
import Link from "next/link"
import { Scale, MessageCircle, Shield } from "lucide-react"

type Props = { params: Promise<{ locale: string }> }

export default async function LegalAdvisorPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <PolicyLayout
      locale={locale}
      title={isRtl ? "مستشار قانوني قريب" : "Areep Legal Advisor"}
    >
      <Card>
        <div className="flex items-start gap-3">
          <Scale className="text-emerald-600 shrink-0 mt-0.5" size={22} />
          <p className="text-sm leading-relaxed">
            {isRtl
              ? "من خلال قريب تقدر تطلب استشارة قانونية من مستشار معتمد على المنصة (عقود، بيع سيارة، إيجار/تمليك، نزاع بسيط…). التواصل يتم داخل الموقع فقط."
              : "Request legal advice from a platform-certified advisor. All chat stays inside Areep."}
          </p>
        </div>
      </Card>

      <Card title={isRtl ? "العمولة" : "Commission"}>
        <ul className="list-disc pe-5 space-y-2 text-sm">
          <li>
            {isRtl
              ? "عمولة المنصة 5% من قيمة الاستشارة المتفق عليها، مقسّمة مناصفة: 2.5% على المستشار + 2.5% على طالب الاستشارة."
              : "Platform takes 5% of the agreed consultation fee, split 2.5% advisor + 2.5% client."}
          </li>
          <li>
            {isRtl
              ? "يتم احتساب العمولة عند إتمام الاتفاق على الأتعاب داخل الشات / بعد تأكيد الطرفين."
              : "Fee is calculated when both parties confirm the consultation fee."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "ضوابط التواصل" : "Chat rules"}>
        <ul className="list-disc pe-5 space-y-2 text-sm">
          <li>
            {isRtl
              ? "التواصل داخل شات الموقع فقط — ممنوع كتابة أرقام تليفونات أو عناوين أو وسائل تواصل خارجية."
              : "In-app chat only — no phone numbers, addresses, or external contacts."}
          </li>
          <li>
            {isRtl
              ? "مخالفة الضوابط قد تؤدي لتجميد الحساب (حسب اتفاقية الاستخدام ومركز الأمان)."
              : "Violations may suspend the account."}
          </li>
          <li>
            {isRtl
              ? "الاستشارة لا تغني عن الحضور الشخصي أمام الجهات الرسمية عند اللزوم."
              : "Advice does not replace formal legal proceedings when required."}
          </li>
        </ul>
      </Card>

      <Card title={isRtl ? "كيف تبدأ؟" : "How to start"}>
        <ol className="list-decimal pe-5 space-y-2 text-sm">
          <li>{isRtl ? "سجّل دخولك لحسابك." : "Sign in to your account."}</li>
          <li>
            {isRtl
              ? "من لوحة الحساب أو أيقونة الميزان ⚖ اطلب مستشاراً."
              : "From dashboard or the scale icon, request an advisor."}
          </li>
          <li>
            {isRtl
              ? "اشرح موضوع الاستشارة (مثلاً: عقد بيع سيارة / إيجار شقة) بدون مشاركة بيانات تواصل خارجية."
              : "Describe the case without sharing external contact details."}
          </li>
          <li>
            {isRtl
              ? "بعد قبول المستشار وتحديد الأتعاب، يتم احتساب عمولة 5% وتستمر المحادثة داخل الموقع."
              : "After fee agreement, 5% platform fee applies and chat continues in-app."}
          </li>
        </ol>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href={`/${locale}/legal-advisor/chat`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          <MessageCircle size={18} />
          {isRtl ? "ابدأ محادثة مع مستشار" : "Start chat with advisor"}
        </Link>
        <Link
          href={`/${locale}/safety`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Shield size={18} />
          {isRtl ? "مركز الأمان" : "Safety center"}
        </Link>
      </div>
    </PolicyLayout>
  )
}
