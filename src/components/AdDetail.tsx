"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle, MapPin, Shield, Pencil } from "lucide-react"
import MarkSoldButton from "@/components/MarkSoldButton"

interface AdDetailProps {
  locale: string
  adId: string
}

export default function AdDetail({ locale, adId }: AdDetailProps) {
  const isRtl = locale === "ar"
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetch(`/api/ads/${adId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAd(data.ad)
        else setError(data.error || "Not found")
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false))
  }, [adId])

  useEffect(() => {
    if (!ad?.userId) return
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const uid = d.user?.id
        setIsOwner(
          Boolean(uid && (uid === ad.userId || d.user?.role === "ADMIN"))
        )
      })
      .catch(() => setIsOwner(false))
  }, [ad?.userId])

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-12">
        {isRtl ? "جاري التحميل..." : "Loading..."}
      </p>
    )
  }

  if (error || !ad) {
    return (
      <div className="bg-white rounded-2xl border p-10 text-center">
        <p className="text-gray-500 mb-3">
          {isRtl ? "الإعلان غير موجود" : "Ad not found"}
        </p>
        <Link
          href={`/${locale}/ads`}
          className="text-emerald-600 text-sm font-medium"
        >
          {isRtl ? "رجوع للإعلانات" : "Back to ads"}
        </Link>
      </div>
    )
  }

  const images = (Array.isArray(ad.images) ? ad.images : []).filter(
    (u: string) =>
      typeof u === "string" &&
      !u.startsWith("/uploads") &&
      u.length > 0
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="aspect-video bg-gray-100 flex items-center justify-center text-5xl">
        {images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          "📦"
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? ad.titleAr : ad.titleEn || ad.titleAr}
          </h1>
          {isOwner && (
            <Link
              href={`/${locale}/ads/${ad.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100"
            >
              <Pencil size={16} />
              {isRtl ? "تعديل الإعلان" : "Edit ad"}
            </Link>
          )}
        </div>

        <p className="text-2xl font-bold text-emerald-700">
          {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {ad.city}
            {ad.area ? ` · ${ad.area}` : ""}
          </span>
          {ad.category && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
              {isRtl ? ad.category.nameAr : ad.category.nameEn}
            </span>
          )}
          {ad.allowEscrow && (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
              <Shield size={14} />
              {isRtl ? "وسيط قريب متاح" : "Escrow available"}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h2 className="font-semibold text-gray-900 mb-2">
            {isRtl ? "الوصف" : "Description"}
          </h2>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {isRtl ? ad.descriptionAr : ad.descriptionEn || ad.descriptionAr}
          </p>
        </div>

        {!isOwner && (
          <Link
            href={`/${locale}/messages?ad=${ad.id}`}
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition"
          >
            <MessageCircle size={18} />
            {isRtl
              ? "تواصل مع البائع (شات داخلي)"
              : "Contact seller (internal chat)"}
          </Link>
        )}

        {ad.userId && (
          <MarkSoldButton locale={locale} adId={ad.id} sellerId={ad.userId} />
        )}
      </div>
    </div>
  )
}
