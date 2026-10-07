"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface Props {
  locale?: string
}

const GOVS = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "القليوبية",
  "الشرقية",
  "الدقهلية",
  "البحيرة",
  "المنوفية",
  "الغربية",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "شمال سيناء",
  "جنوب سيناء",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
]

export default function HomeFilters({ locale = "ar" }: Props) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const sp = useSearchParams()

  const [gov, setGov] = useState(sp.get("gov") || "")
  const [city, setCity] = useState(sp.get("city") || "")
  const [minPrice, setMinPrice] = useState(sp.get("min") || "0")
  const [maxPrice, setMaxPrice] = useState(sp.get("max") || "")
  const [sort, setSort] = useState(sp.get("sort") || "newest")

  const apply = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams()
    const g = overrides?.gov ?? gov
    const c = overrides?.city ?? city
    const min = overrides?.min ?? minPrice
    const max = overrides?.max ?? maxPrice
    const s = overrides?.sort ?? sort
    if (g) params.set("gov", g)
    if (c) params.set("city", c)
    if (min && min !== "0") params.set("min", min)
    if (max) params.set("max", max)
    if (s && s !== "newest") params.set("sort", s)
    const q = params.toString()
    router.push(`/${locale}/ads${q ? `?${q}` : ""}`)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-3 sm:px-4 py-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 items-end">
        {/* Governorate */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1 text-center sm:text-start">
            {isRtl ? "المحافظة" : "Governorate"}
          </label>
          <select
            value={gov}
            onChange={(e) => {
              setGov(e.target.value)
              apply({ gov: e.target.value })
            }}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{isRtl ? "كل المحافظات" : "All"}</option>
            {GOVS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* City / area */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1 text-center sm:text-start">
            {isRtl ? "المدينة / الحي" : "City / area"}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            onBlur={() => apply()}
            placeholder={isRtl ? "مثال: المعادي" : "e.g. Maadi"}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {/* Price from */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1 text-center sm:text-start">
            {isRtl ? "السعر من" : "Price from"}
          </label>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => apply()}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {/* Price to */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1 text-center sm:text-start">
            {isRtl ? "السعر إلى" : "Price to"}
          </label>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => apply()}
            placeholder="∞"
            className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1 text-center sm:text-start">
            {isRtl ? "الترتيب" : "Sort"}
          </label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              apply({ sort: e.target.value })
            }}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm outline-none focus:border-emerald-500"
          >
            <option value="newest">{isRtl ? "الأحدث" : "Newest"}</option>
            <option value="price_asc">{isRtl ? "السعر: الأقل أولاً" : "Price: low to high"}</option>
            <option value="price_desc">{isRtl ? "السعر: الأعلى أولاً" : "Price: high to low"}</option>
            <option value="nearby">{isRtl ? "الأقرب إليّ" : "Nearest"}</option>
          </select>
        </div>
      </div>
    </div>
  )
}
