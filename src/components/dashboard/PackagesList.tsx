"use client"

import { Check } from "lucide-react"

interface PackagesListProps {
  locale: string
}

const packages = [
  {
    id: "free",
    nameAr: "مجانية",
    nameEn: "Free",
    price: 0,
    ads: 5,
    featured: 0,
    featuredDays: 0,
    featuresAr: ["5 إعلانات / شهر", "إعلان عادي فقط"],
    featuresEn: ["5 ads / month", "Standard ads only"],
    popular: false,
  },
  {
    id: "basic",
    nameAr: "أساسية",
    nameEn: "Basic",
    price: 149,
    ads: 15,
    featured: 3,
    featuredDays: 7,
    featuresAr: ["15 إعلان / شهر", "3 إعلانات مميزة (7 أيام)", "إحصائيات بسيطة", "دعم فني"],
    featuresEn: ["15 ads / month", "3 featured ads (7 days)", "Basic stats", "Support"],
    popular: false,
  },
  {
    id: "pro",
    nameAr: "احترافية",
    nameEn: "Professional",
    price: 349,
    ads: 40,
    featured: 10,
    featuredDays: 15,
    featuresAr: ["40 إعلان / شهر", "10 إعلانات مميزة (15 يوم)", "شارة بائع محترف", "أولوية في البحث"],
    featuresEn: ["40 ads / month", "10 featured ads (15 days)", "Pro seller badge", "Search priority"],
    popular: true,
  },
  {
    id: "cars",
    nameAr: "معارض سيارات",
    nameEn: "Car Dealers",
    price: 799,
    ads: -1,
    featured: 20,
    featuredDays: 30,
    featuresAr: ["إعلانات غير محدودة", "20 إعلان مميز (30 يوم)", "صفحة خاصة للمعرض", "نظام وسيط مخفض"],
    featuresEn: ["Unlimited ads", "20 featured ads (30 days)", "Dealer page", "Discounted escrow"],
    popular: false,
  },
  {
    id: "realestate",
    nameAr: "عقارات محترفة",
    nameEn: "Real Estate Pro",
    price: 599,
    ads: -1,
    featured: 15,
    featuredDays: 30,
    featuresAr: ["إعلانات غير محدودة", "15 إعلان مميز (30 يوم)", "ربط بمستشار قانوني", "عقود إلكترونية"],
    featuresEn: ["Unlimited ads", "15 featured ads (30 days)", "Legal consultant link", "E-contracts"],
    popular: false,
  },
]

export default function PackagesList({ locale }: PackagesListProps) {
  const isRtl = locale === "ar"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRtl ? "الباقات والاشتراكات" : "Packages & Subscriptions"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl ? "اختر الباقة المناسبة لنشاطك" : "Choose the package that fits your activity"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-2xl border p-5 flex flex-col ${
              pkg.popular ? "border-emerald-400 shadow-md shadow-emerald-50" : "border-gray-100"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {isRtl ? "الأكثر طلباً" : "Most Popular"}
              </span>
            )}

            <h3 className="text-lg font-bold text-gray-900">
              {isRtl ? pkg.nameAr : pkg.nameEn}
            </h3>

            <div className="mt-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {pkg.price === 0 ? (isRtl ? "مجاناً" : "Free") : `${pkg.price}`}
              </span>
              {pkg.price > 0 && (
                <span className="text-sm text-gray-500 ms-1">
                  {isRtl ? "جنيه / شهر" : "EGP / month"}
                </span>
              )}
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {(isRtl ? pkg.featuresAr : pkg.featuresEn).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${
                pkg.popular
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {pkg.price === 0
                ? isRtl ? "الباقة الحالية" : "Current Plan"
                : isRtl ? "اشترك الآن" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
