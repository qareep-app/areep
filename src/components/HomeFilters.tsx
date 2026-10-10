"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, Search } from "lucide-react"

interface Props {
  locale?: string
  variant?: "bar" | "panel"
}

const GOVS = [
  "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الشرقية", "الدقهلية",
  "البحيرة", "المنوفية", "الغربية", "كفر الشيخ", "دمياط", "بورسعيد",
  "الإسماعيلية", "السويس", "شمال سيناء", "جنوب سيناء", "الفيوم", "بني سويف",
  "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر",
  "الوادي الجديد", "مطروح",
]

export default function HomeFilters({ locale = "ar", variant = "bar" }: Props) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const sp = useSearchParams()

  const [gov, setGov] = useState(sp.get("gov") || "")
  const [city, setCity] = useState(sp.get("city") || "")
  const [minPrice, setMinPrice] = useState(sp.get("min") || "")
  const [maxPrice, setMaxPrice] = useState(sp.get("max") || "")
  const [sort, setSort] = useState(sp.get("sort") || "newest")
  const [condition, setCondition] = useState(sp.get("condition") || "")
  const [importType, setImportType] = useState(sp.get("importType") || "")

  const category = sp.get("category") || ""
  const isVehicle = ["cars", "motorcycles", "car-parts", "motorcycle-parts"].includes(category)

  const apply = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams()
    // preserve existing non-filter params
    const cat = overrides?.category ?? category
    const q = overrides?.q ?? (sp.get("q") || "")
    if (cat) params.set("category", cat)
    if (q) params.set("q", q)

    const g = overrides?.gov ?? gov
    const c = overrides?.city ?? city
    const min = overrides?.min ?? minPrice
    const max = overrides?.max ?? maxPrice
    const s = overrides?.sort ?? sort
    const cond = overrides?.condition ?? condition
    const imp = overrides?.importType ?? importType

    if (g) params.set("gov", g)
    if (c) params.set("city", c)
    if (min) params.set("min", min)
    if (max) params.set("max", max)
    if (s && s !== "newest") params.set("sort", s)
    if (cond) params.set("condition", cond)
    if (imp) params.set("importType", imp)

    const qs = params.toString()
    router.push(`/${locale}/ads${qs ? `?${qs}` : ""}`)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Filter size={16} className="text-emerald-600" />
        {isRtl ? "تصفية النتائج" : "Filter results"}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="col-span-1">
          <label className="block text-[11px] text-gray-500 mb-1">
            {isRtl ? "المحافظة" : "Governorate"}
          </label>
          <select
            value={gov}
            onChange={(e) => setGov(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          >
            <option value="">{isRtl ? "كل المحافظات" : "All"}</option>
            {GOVS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-[11px] text-gray-500 mb-1">
            {isRtl ? "المدينة / الحي" : "City / area"}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={isRtl ? "مثال: المعادي" : "e.g. Maadi"}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] text-gray-500 mb-1">{isRtl ? "السعر من" : "Min price"}</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-[11px] text-gray-500 mb-1">{isRtl ? "السعر إلى" : "Max price"}</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
            placeholder={isRtl ? "أي سعر" : "Any"}
          />
        </div>

        <div>
          <label className="block text-[11px] text-gray-500 mb-1">{isRtl ? "الترتيب" : "Sort"}</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          >
            <option value="newest">{isRtl ? "الأحدث" : "Newest"}</option>
            <option value="price_asc">{isRtl ? "السعر ↑" : "Price ↑"}</option>
            <option value="price_desc">{isRtl ? "السعر ↓" : "Price ↓"}</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => apply()}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Search size={16} />
            {isRtl ? "تطبيق" : "Apply"}
          </button>
        </div>
      </div>

      {/* Vehicle-only filters */}
      {isVehicle && (
        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-600">
            {isRtl ? "فلاتر المركبات" : "Vehicle filters"}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center">{isRtl ? "الحالة:" : "Condition:"}</span>
            {[
              { v: "", ar: "الكل", en: "All" },
              { v: "USED", ar: "مستعمل", en: "Used" },
              { v: "NEW", ar: "جديد", en: "New" },
            ].map((f) => (
              <button
                key={f.v || "c-all"}
                type="button"
                onClick={() => {
                  setCondition(f.v)
                  apply({ condition: f.v })
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  condition === f.v
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-600"
                }`}
              >
                {isRtl ? f.ar : f.en}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center">{isRtl ? "النوع:" : "Type:"}</span>
            {[
              { v: "", ar: "الكل", en: "All" },
              { v: "local", ar: "محلي", en: "Local" },
              { v: "imported", ar: "مستورد", en: "Imported" },
              { v: "transfer", ar: "تنازل", en: "Transfer" },
            ].map((f) => (
              <button
                key={f.v || "i-all"}
                type="button"
                onClick={() => {
                  setImportType(f.v)
                  apply({ importType: f.v })
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  importType === f.v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600"
                }`}
              >
                {isRtl ? f.ar : f.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isVehicle && category && (
        <p className="text-[11px] text-gray-400">
          {isRtl
            ? "فلاتر مستعمل/جديد/مستورد تظهر عند اختيار فئة السيارات أو الموتسيكلات."
            : "Used/New/Import filters appear when Cars or Motorcycles category is selected."}
        </p>
      )}
    </div>
  )
}
