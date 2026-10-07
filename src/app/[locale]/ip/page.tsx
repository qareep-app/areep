import { setRequestLocale } from "next-intl/server"
import PolicyLayout, { Card } from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function IpPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"
  return (
    <PolicyLayout locale={locale} title={isRtl ? "سياسة الملكية الفكرية" : "Intellectual property"}>
      <Card title={isRtl ? "حقوق الموقع" : "Platform rights"}>
        <p>
          {isRtl
            ? "اسم «قريب» وشعاره وتصميمه ومحتواه مملوكة للمنصة، ومينفعش استخدامها من غير إذن كتابي."
            : "Areep name, logo, and design are owned by the platform."}
        </p>
      </Card>
      <Card title={isRtl ? "محتوى المستخدمين" : "User content"}>
        <ul className="list-disc pe-5 space-y-2">
          <li>{isRtl ? "أنت بتحتفظ بحقوق الصور والنصوص اللي بترفعها، وبتمنحنا ترخيصاً لعرضها على الموقع." : "You keep rights; you grant us a license to display them."}</li>
          <li>{isRtl ? "ممنوع رفع صور أو محتوى مملوك لغيرك من غير تصريح." : "No uploading others' content without permission."}</li>
          <li>{isRtl ? "ممنوع بيع منتجات مقلّدة أو تحمل علامات تجارية بشكل مخالف." : "No counterfeit trademarked goods."}</li>
        </ul>
      </Card>
      <Card title={isRtl ? "الإبلاغ عن مخالفة" : "Report infringement"}>
        <p>
          {isRtl
            ? "لو شايف إن إعلان بيتعدّى على حقوقك، تواصل معنا عبر صفحة «اتصل بنا» ومعاك إثبات الملكية، وهنراجع الإعلان ونتصرف."
            : "Contact us with proof of ownership to report infringement."}
        </p>
      </Card>
    </PolicyLayout>
  )
}
