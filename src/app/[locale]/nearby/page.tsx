"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"
import { MapPin, Loader2 } from "lucide-react"

/** Rough centers for major Egyptian cities (lat, lng, radius km, names) */
const CITIES: { nameAr: string; nameEn: string; lat: number; lng: number; radiusKm: number }[] = [
  { nameAr: "القاهرة", nameEn: "Cairo", lat: 30.0444, lng: 31.2357, radiusKm: 35 },
  { nameAr: "الجيزة", nameEn: "Giza", lat: 30.0131, lng: 31.2089, radiusKm: 25 },
  { nameAr: "الإسكندرية", nameEn: "Alexandria", lat: 31.2001, lng: 29.9187, radiusKm: 30 },
  { nameAr: "العاشر من رمضان", nameEn: "10th of Ramadan", lat: 30.298, lng: 31.741, radiusKm: 20 },
  { nameAr: "المنصورة", nameEn: "Mansoura", lat: 31.0409, lng: 31.3785, radiusKm: 20 },
  { nameAr: "طنطا", nameEn: "Tanta", lat: 30.7865, lng: 31.0004, radiusKm: 15 },
  { nameAr: "أسيوط", nameEn: "Assiut", lat: 27.1809, lng: 31.1837, radiusKm: 20 },
  { nameAr: "السويس", nameEn: "Suez", lat: 29.9668, lng: 32.5498, radiusKm: 20 },
  { nameAr: "الإسماعيلية", nameEn: "Ismailia", lat: 30.5965, lng: 32.2715, radiusKm: 18 },
  { nameAr: "بورسعيد", nameEn: "Port Said", lat: 31.2653, lng: 32.3019, radiusKm: 15 },
  { nameAr: "الأقصر", nameEn: "Luxor", lat: 25.6872, lng: 32.6396, radiusKm: 15 },
  { nameAr: "أسوان", nameEn: "Aswan", lat: 24.0889, lng: 32.8998, radiusKm: 15 },
]

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function detectCity(lat: number, lng: number) {
  let best: (typeof CITIES)[0] | null = null
  let bestDist = Infinity
  for (const c of CITIES) {
    const d = distanceKm(lat, lng, c.lat, c.lng)
    if (d < c.radiusKm && d < bestDist) {
      best = c
      bestDist = d
    }
  }
  return best
}

export default function NearbyPage({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState("ar")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [detectedCity, setDetectedCity] = useState<(typeof CITIES)[0] | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [ads, setAds] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])

  useEffect(() => {
    Promise.resolve(params).then((p) => setLocale(p.locale || "ar"))
  }, [params])

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع")
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        setDetectedCity(detectCity(lat, lng))
        setLoading(false)
      },
      () => {
        setError("تم رفض إذن الموقع — هنعرض كل الإعلانات")
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }, [])

  useEffect(() => {
    fetch("/api/ads?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAds(d.ads || [])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!detectedCity) {
      setFiltered(ads)
      return
    }
    const names = [detectedCity.nameAr, detectedCity.nameEn].map((s) => s.toLowerCase())
    const match = ads.filter((ad) => {
      const city = (ad.city || "").toLowerCase()
      return names.some((n) => city.includes(n) || n.includes(city.trim()))
    })
    // If nothing matches this city, show all but keep the location banner
    setFiltered(match.length > 0 ? match : ads)
  }, [ads, detectedCity])

  const isRtl = locale === "ar"
  const showingAllBecauseEmpty =
    detectedCity &&
    filtered.length === ads.length &&
    ads.length > 0 &&
    !ads.some((ad) => {
      const city = (ad.city || "").toLowerCase()
      return [detectedCity.nameAr, detectedCity.nameEn]
        .map((s) => s.toLowerCase())
        .some((n) => city.includes(n))
    })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRtl ? "قريب مني" : "Near me"}
          </h1>

          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-6">
              <Loader2 className="animate-spin" size={18} />
              {isRtl ? "جاري تحديد موقعك..." : "Detecting location..."}
            </div>
          )}

          {coords && detectedCity && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 text-sm text-emerald-800 flex items-start gap-2">
              <MapPin size={18} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">
                  {isRtl ? "موقعك التقريبي: " : "Approximate location: "}
                  {isRtl ? detectedCity.nameAr : detectedCity.nameEn}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </div>
              </div>
            </div>
          )}

          {coords && !detectedCity && !loading && (
            <p className="text-sm text-amber-700 mb-4">
              {isRtl
                ? "تم تحديد إحداثياتك، لكن المدينة مش ضمن القائمة المعروفة — هنعرض كل الإعلانات"
                : "Coordinates detected but city not in known list — showing all ads"}
            </p>
          )}

          {showingAllBecauseEmpty && (
            <p className="text-sm text-amber-700 mb-4">
              {isRtl
                ? `مفيش إعلانات في «${detectedCity?.nameAr}» حالياً — بنعرض باقي الإعلانات`
                : `No ads in ${detectedCity?.nameEn} yet — showing all ads`}
            </p>
          )}

          {error && <p className="text-sm text-amber-700 mb-4">{error}</p>}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {filtered.map((ad) => (
              <Link
                key={ad.id}
                href={`/${locale}/ads/${ad.id}`}
                className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-3xl">
                  {ad.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    "📦"
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate text-sm">{ad.titleAr}</h3>
                  <p className="text-emerald-700 font-bold text-sm">
                    {Number(ad.price).toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                  </p>
                  <p className="text-xs text-gray-500">{ad.city}</p>
                </div>
              </Link>
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              {isRtl ? "مفيش إعلانات" : "No ads"}
            </p>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
