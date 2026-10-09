"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"

interface PackagesListProps {
  locale: string
}

const packages = [
  {
    id: "free",
    nameAr: "مجانية",
    nameEn: "Free",
    price: 0,
    featuresAr: ["5 إعلانات / شهر", "إعلان عادي فقط"],
    featuresEn: ["5 ads / month", "Standard ads only"],
    popular: false,
  },
  {
    id: "basic",
    nameAr: "أساسية",
    nameEn: "Basic",
    price: 149,
    featuresAr: ["15 إعلان / شهر", "3 إعلانات مميزة (7 أيام)", "إحصائيات بسيطة", "دعم فني"],
    featuresEn: ["15 ads / month", "3 featured (7 days)", "Basic stats", "Support"],
    popular: false,
  },
  {
    id: "pro",
    nameAr: "احترافية",
    nameEn: "Professional",
    price: 349,
    featuresAr: ["40 إعلان / شهر", "10 إعلانات مميزة (15 يوم)", "شارة بائع محترف", "أولوية في البحث"],
    featuresEn: ["40 ads / month", "10 featured (15 days)", "Pro badge", "Search priority"],
    popular: true,
  },
  {
    id: "cars",
    nameAr: "معارض سيارات",
    nameEn: "Car Dealers",
    price: 799,
    featuresAr: ["إعلانات غير محدودة", "20 إعلان مميز (30 يوم)", "صفحة خاصة للمعرض"],
    featuresEn: ["Unlimited ads", "20 featured (30 days)", "Dealer page"],
    popular: false,
  },
  {
    id: "realestate",
    nameAr: "عقارات محترفة",
    nameEn: "Real Estate Pro",
    price: 599,
    featuresAr: ["إعلانات غير محدودة", "15 إعلان مميز (30 يوم)", "ربط بمستشار قانوني"],
    featuresEn: ["Unlimited ads", "15 featured (30 days)", "Legal link"],
    popular: false,
  },
]

export default function PackagesList({ locale }: PackagesListProps) {
  const isRtl = locale === "ar"
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState("")
  const [current, setCurrent] = useState("free")

  const subscribe = async (packageId: string, price: number) => {
    setMsg("")
    setBusy(packageId)
    try {
      if (price === 0) {
        setCurrent("free")
        setMsg(isRtl ? "تم تفعيل الباقة المجانية" : "Free plan activated")
        return
      }

      const res = await fetch("/api/paymob/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "package",
          amount: price,
          referenceId: packageId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الدفع")

      if (data.iframeUrl) {
        window.location.href = data.iframeUrl
        return
      }
      setMsg(isRtl ? "تم إنشاء الطلب لكن رابط الدفع غير متاح — راجع مفاتيح Paymob" : "No payment URL")
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? "الباقات والاشتراكات" : "Packages & Subscriptions"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "الدفع عبر Paymob: بطاقات بنكية، محافظ إلكترونية حسب تفعيل حسابك"
            : "Pay via Paymob: cards and wallets per your merchant setup"}
        </p>
      </div>

      {msg && (
        <div className="text-sm rounded-xl px-4 py-3 bg-amber-50 text-amber-900 border border-amber-100">
          {msg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const features = isRtl ? pkg.featuresAr : pkg.featuresEn
          const isCurrent = current === pkg.id
          return (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl border p-5 flex flex-col ${
                pkg.popular ? "border-emerald-500 shadow-md ring-1 ring-emerald-200" : "border-gray-100"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2 start-4 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  {isRtl ? "الأكثر طلباً" : "Popular"}
                </span>
              )}
              <h3 className="text-lg font-bold">{isRtl ? pkg.nameAr : pkg.nameEn}</h3>
              <div className="mt-2 mb-4">
                {pkg.price === 0 ? (
                  <span className="text-3xl font-bold">{isRtl ? "مجاناً" : "Free"}</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className="text-sm text-gray-500"> {isRtl ? "جنيه / شهر" : "EGP / mo"}</span>
                  </>
                )}
              </div>
              <ul className="space-y-2 flex-1 mb-5">
                {features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={busy === pkg.id || isCurrent}
                onClick={() => subscribe(pkg.id, pkg.price)}
                className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                  isCurrent
                    ? "bg-gray-100 text-gray-500"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {busy === pkg.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isCurrent ? (
                  isRtl ? "الباقة الحالية" : "Current"
                ) : (
                  isRtl ? "اشترك الآن" : "Subscribe"
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border p-5 text-sm text-gray-600 space-y-2">
        <p className="font-semibold text-gray-800">
          {isRtl ? "طرق الدفع المتاحة عبر Paymob" : "Payment methods via Paymob"}
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>{isRtl ? "بطاقات بنكية (فيزا / ماستركارد / ميزة)" : "Bank cards (Visa / Mastercard / Meeza)"}</li>
          <li>{isRtl ? "محافظ إلكترونية (حسب تفعيل حسابك: فودافون كاش، انستاباي…)" : "Wallets if enabled on your Paymob account"}</li>
          <li>{isRtl ? "فوري وكود دفع — لو مفعّلين في لوحة Paymob" : "Fawry / cash codes if enabled"}</li>
        </ul>
        <p className="text-xs text-gray-400">
          {isRtl
            ? "كل طريقة تظهر في صفحة الدفع حسب الـ Integration المربوط بحساب Paymob الخاص بك."
            : "Methods shown depend on integrations enabled on your Paymob merchant account."}
        </p>
      </div>
    </div>
  )
}
