import { setRequestLocale } from "next-intl/server"
import PolicyLayout from "@/components/PolicyLayout"

type Props = { params: Promise<{ locale: string }> }

export default async function FeesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <PolicyLayout
      locale={locale}
      title={isRtl ? "العمولة وسداد الرسوم" : "Fees & commission"}
    >
      <section className="space-y-4 text-sm text-gray-700 leading-relaxed">
        <div className="bg-white border rounded-2xl p-5 space-y-2">
          <h2 className="font-bold text-gray-900">{isRtl ? "1) العمولة العامة" : "1) Standard fee"}</h2>
          <p>{isRtl ? "2% من قيمة البيعة على البائع في معظم الفئات." : "2% of sale value on the seller for most categories."}</p>
        </div>
        <div className="bg-white border rounded-2xl p-5 space-y-2">
          <h2 className="font-bold text-gray-900">{isRtl ? "2) السيارات وقطع الغيار والموتسيكلات" : "2) Vehicles & parts"}</h2>
          <ul className="list-disc pe-5 space-y-1">
            <li>{isRtl ? "مع وسيط قريب: 2.5% بائع + 2.5% مشتري" : "With escrow: 2.5% seller + 2.5% buyer"}</li>
            <li>{isRtl ? "بدون وسيط: 2% على البائع فقط" : "Without escrow: 2% seller only"}</li>
          </ul>
        </div>
        <div className="bg-white border rounded-2xl p-5 space-y-2">
          <h2 className="font-bold text-gray-900">{isRtl ? "3) العقارات" : "3) Real estate"}</h2>
          <ul className="list-disc pe-5 space-y-1">
            <li>{isRtl ? "إيجار: نصف شهر من المؤجر + نصف شهر من المستأجر" : "Rent: half month from each party"}</li>
            <li>{isRtl ? "تمليك مع وسيط: 2.5% + 2.5% / بدون وسيط: 2% بائع" : "Sale with escrow 2.5%+2.5% / without 2% seller"}</li>
          </ul>
        </div>
        <div className="bg-white border rounded-2xl p-5 space-y-2">
          <h2 className="font-bold text-gray-900">{isRtl ? "4) البيع العادي (دفع عند الاستلام)" : "4) COD / normal sale"}</h2>
          <p>
            {isRtl
              ? "ثمن السلعة بين الطرفين مباشرة. بعد تأكيد البيع تُنشأ فاتورة عمولة على البائع (من سعر الإعلان) وتُسدَّد عبر Paymob خلال 3 أيام. التأخير يمنع نشر/تمييز إعلانات جديدة."
              : "Item price is peer-to-peer. After confirming the sale, a seller commission invoice is due via Paymob within 3 days. Overdue invoices block new/featured ads."}
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-5 space-y-2">
          <h2 className="font-bold text-gray-900">{isRtl ? "5) الباقات" : "5) Packages"}</h2>
          <p>
            {isRtl
              ? "الباقات دخل أساسي لعرض وتمييز الإعلانات (مجانية / أساسية / احترافية وغيرها) وتُدفع عبر Paymob."
              : "Packages power listing limits and featured slots; paid via Paymob."}
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-5 space-y-2">
          <h2 className="font-bold text-gray-900">{isRtl ? "6) وسيط قريب" : "6) Escrow"}</h2>
          <p>
            {isRtl
              ? "المشتري يدفع عبر Paymob لحساب المنصة. بعد تأكيد الاستلام يُحتسب صافي البائع ويُصرف يدوياً على بيانات البنك/المحفظة المسجّلة، بعد خصم عمولة قريب."
              : "Buyer pays via Paymob to the platform. After receipt confirmation, seller net is paid out to saved bank/wallet after Areep fees."}
          </p>
        </div>
      </section>
    </PolicyLayout>
  )
}
