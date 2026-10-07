import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "اتصل بنا" : "Contact us"}>
      <p className="text-sm text-gray-600 text-center mb-4">
        {isRtl
          ? "لأي استفسار أو شكوى أو بلاغ عن إعلان مخالف، تواصل معنا:"
          : "Questions, complaints, or reports:"}
      </p>
      <Card>
        <div className="space-y-3 text-center">
          <p>
            <span className="text-gray-500">{isRtl ? "البريد الإلكتروني: " : "Email: "}</span>
            <a href="mailto:dokanelbalad@gmail.com" className="text-emerald-700 font-semibold">
              dokanelbalad@gmail.com
            </a>
          </p>
          <p>
            <span className="text-gray-500">{isRtl ? "واتساب: " : "WhatsApp: "}</span>
            <a
              href="https://wa.me/201027058242"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold"
              dir="ltr"
            >
              +201027058242
            </a>
          </p>
        </div>
      </Card>
    </PolicyLayout>
  )
}
