"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, Sparkles, Package } from "lucide-react"

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
    featuresAr: ["15 إعلان / شهر", "3 إعلانات مميزة", "إحصائيات بسيطة", "دعم فني"],
    featuresEn: ["15 ads / month", "3 featured", "Basic stats", "Support"],
    popular: false,
  },
  {
    id: "pro",
    nameAr: "احترافية",
    nameEn: "Professional",
    price: 349,
    featuresAr: ["40 إعلان / شهر", "10 إعلانات مميزة", "شارة بائع محترف", "أولوية في البحث"],
    featuresEn: ["40 ads / month", "10 featured", "Pro badge", "Search priority"],
    popular: true,
  },
  {
    id: "cars",
    nameAr: "معارض سيارات",
    nameEn: "Car Dealers",
    price: 799,
    featuresAr: ["إعلانات غير محدودة", "20 إعلان مميز", "صفحة خاصة للمعرض"],
    featuresEn: ["Unlimited ads", "20 featured", "Dealer page"],
    popular: false,
  },
  {
    id: "realestate",
    nameAr: "عقارات محترفة",
    nameEn: "Real Estate Pro",
    price: 599,
    featuresAr: ["إعلانات غير محدودة", "15 إعلان مميز", "ربط بمستشار قانوني"],
    featuresEn: ["Unlimited ads", "15 featured", "Legal link"],
    popular: false,
  },
]

export default function PackagesList({ locale }: PackagesListProps) {
  const isRtl = locale === "ar"
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState("")
  const [quota, setQuota] = useState<any>(null)

  const loadQuota = () => {
    fetch("/api/packages/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setQuota(d.quota)
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadQuota()
  }, [])

  const subscribe = async (packageId: string, price: number) => {
    setMsg("")
    setBusy(packageId)
    try {
      if (price === 0) {
        const res = await fetch("/api/packages/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ packageSlug: "free" }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "failed")
        setMsg(isRtl ? "تم تفعيل الباقة المجانية" : "Free plan activated")
        loadQuota()
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
      throw new Error(data.error || "لا يوجد رابط دفع")
    } catch (e: any) {
      setMsg(e.message || "error")
    } finally {
      setBusy(null)
    }
  }

  const currentSlug = quota?.slug || "free"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {isRtl ? "الباقات" : "Packages"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "اختر باقة مناسبة لعرض إعلاناتك وتمييزها"
            : "Choose a plan to post and feature your ads"}
        </p>
      </div>

      {/* Current quota card */}
      <div className="bg-gradient-to-l from-emerald-600 to-emerald-800 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Package size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-emerald-100">
              {isRtl ? "باقتك الحالية" : "Current plan"}
            </div>
            <div className="text-xl font-bold mt-0.5">
              {isRtl ? quota?.nameAr || "مجانية" : quota?.nameEn || "Free"}
            </div>
            {quota?.endDate && (
              <div className="text-xs text-emerald-100 mt-1">
                {isRtl ? "سارية حتى" : "Valid until"}{" "}
                {new Date(quota.endDate).toLocaleDateString(isRtl ? "ar-EG" : "en-GB")}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xs text-emerald-100">{isRtl ? "إعلانات متبقية" : "Ads left"}</div>
            <div className="text-2xl font-bold mt-1">
              {quota?.adsRemaining === null || quota?.maxAds == null
                ? isRtl
                  ? "∞"
                  : "∞"
                : quota?.adsRemaining ?? "—"}
            </div>
            <div className="text-[11px] text-emerald-100 mt-1">
              {quota?.maxAds == null
                ? isRtl
                  ? "غير محدود"
                  : "Unlimited"
                : `${quota?.adsUsed ?? 0} / ${quota.maxAds}`}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xs text-emerald-100 flex items-center gap-1">
              <Sparkles size={12} />
              {isRtl ? "مميز متبقي" : "Featured left"}
            </div>
            <div className="text-2xl font-bold mt-1">{quota?.featuredRemaining ?? 0}</div>
            <div className="text-[11px] text-emerald-100 mt-1">
              {quota?.featuredUsed ?? 0} / {quota?.featuredAds ?? 0}
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {msg}
        </p>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const isCurrent = currentSlug === pkg.id
          return (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl border p-5 flex flex-col ${
                pkg.popular ? "border-emerald-400 shadow-md" : "border-gray-100"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 start-4 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  {isRtl ? "الأكثر طلباً" : "Popular"}
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-lg">
                {isRtl ? pkg.nameAr : pkg.nameEn}
              </h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-emerald-700">{pkg.price}</span>
                <span className="text-sm text-gray-500 ms-1">{isRtl ? "جنيه / شهر" : "EGP / mo"}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-1">
                {(isRtl ? pkg.featuresAr : pkg.featuresEn).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={!!busy || isCurrent}
                onClick={() => subscribe(pkg.id, pkg.price)}
                className={`mt-5 w-full h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 ${
                  isCurrent
                    ? "bg-gray-100 text-gray-500 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {busy === pkg.id ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isCurrent ? (
                  isRtl ? "الباقة الحالية" : "Current plan"
                ) : pkg.price === 0 ? (
                  isRtl ? "تفعيل مجاني" : "Activate free"
                ) : (
                  isRtl ? "اشترك الآن" : "Subscribe"
                )}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400">
        {isRtl
          ? "طرق الدفع تعتمد على تكاملات Paymob المفعّلة في حساب التاجر (بطاقات، محافظ، فوري…)."
          : "Payment methods depend on integrations enabled on your Paymob merchant account."}
      </p>
    </div>
  )
}
