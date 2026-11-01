import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"
import { getCompanyInfo } from "@/lib/company-info"
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react"

type Props = { params: Promise<{ locale: string }> }

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  const c = getCompanyInfo()

  return (
    <PolicyLayout locale={locale} title={isRtl ? "اتصل بنا" : "Contact us"}>
      <p className="text-sm text-gray-600 text-center mb-4 max-w-xl mx-auto">
        {isRtl
          ? "بيانات التواصل الرسمية لمنصة قريب (مطلوبة لخدمات المدفوعات الإلكترونية وفق تعليمات البنك المركزي المصري)."
          : "Official contact details for Areep (required for electronic payments under CBE guidelines)."}
      </p>

      <Card>
        <div className="space-y-5 text-start">
          <div className="flex gap-3">
            <MapPin className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="text-xs text-gray-500 font-medium mb-0.5">
                {isRtl ? "العنوان داخل مصر" : "Address in Egypt"}
              </div>
              <p className="text-gray-900 font-medium leading-relaxed">
                {isRtl ? c.addressAr : c.addressEn}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Phone className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="text-xs text-gray-500 font-medium mb-0.5">
                {isRtl ? "الهاتف" : "Phone"}
              </div>
              <a
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="text-emerald-700 font-semibold text-lg"
                dir="ltr"
              >
                {c.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <Mail className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="text-xs text-gray-500 font-medium mb-0.5">
                {isRtl ? "البريد الإلكتروني" : "Email"}
              </div>
              <a
                href={`mailto:${c.email}`}
                className="text-emerald-700 font-semibold break-all"
              >
                {c.email}
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <MessageCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <div className="text-xs text-gray-500 font-medium mb-0.5">WhatsApp</div>
              <a
                href={`https://wa.me/${c.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold"
                dir="ltr"
              >
                +{c.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </Card>

      <p className="text-xs text-gray-400 text-center mt-6">
        {isRtl
          ? "للاستفسارات والشكاوى وبلاغات الإعلانات المخالفة — يُفضّل التواصل عبر البريد أو واتساب خلال ساعات العمل."
          : "For inquiries, complaints, and reports — prefer email or WhatsApp during business hours."}
      </p>
    </PolicyLayout>
  )
}
