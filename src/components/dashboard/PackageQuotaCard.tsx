"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sparkles, Package } from "lucide-react"

export default function PackageQuotaCard({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [quota, setQuota] = useState<any>(null)

  useEffect(() => {
    fetch("/api/packages/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.ok && setQuota(d.quota))
      .catch(() => {})
  }, [])

  if (!quota) return null

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Package size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {isRtl ? "باقتك:" : "Plan:"} {isRtl ? quota.nameAr : quota.nameEn || quota.slug}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
            <span>
              {isRtl ? "إعلانات متبقية:" : "Ads left:"}{" "}
              <strong>
                {quota.adsRemaining === null ? "∞" : quota.adsRemaining}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              {isRtl ? "مميز متبقي:" : "Featured left:"}{" "}
              <strong>{quota.featuredRemaining}</strong>
            </span>
          </div>
        </div>
      </div>
      <Link
        href={`/${locale}/dashboard/packages`}
        className="text-sm font-semibold text-emerald-700 hover:underline"
      >
        {isRtl ? "ترقية الباقة" : "Upgrade"}
      </Link>
    </div>
  )
}
