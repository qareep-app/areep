"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Shield, Loader2, X, MapPin, Navigation, Map, Film, ImagePlus } from "lucide-react"

interface AddAdFormProps {
  locale: string
}

const categories = [
  { value: "cars", labelAr: "سيارات", labelEn: "Cars" },
  { value: "car-parts", labelAr: "قطع غيار سيارات", labelEn: "Car Parts" },
  { value: "motorcycles", labelAr: "موتسيكلات وتروسيكلات", labelEn: "Motorcycles" },
  { value: "motorcycle-parts", labelAr: "قطع غيار موتسيكلات", labelEn: "Motorcycle Parts" },
  { value: "real-estate-sale", labelAr: "عقارات - تمليك", labelEn: "Real Estate - Sale" },
  { value: "real-estate-rent", labelAr: "عقارات - إيجار", labelEn: "Real Estate - Rent" },
  { value: "mobiles", labelAr: "موبايلات وتابلت", labelEn: "Mobiles & Tablets" },
  { value: "electronics", labelAr: "أجهزة كهربائية ومنزلية", labelEn: "Home Appliances" },
  { value: "furniture", labelAr: "أثاث ومفروشات", labelEn: "Furniture" },
  { value: "fashion", labelAr: "ملابس وأحذية", labelEn: "Fashion" },
  { value: "pets", labelAr: "حيوانات أليفة", labelEn: "Pets" },
  { value: "jobs", labelAr: "وظائف وخدمات", labelEn: "Jobs & Services" },
  { value: "services", labelAr: "خدمات", labelEn: "Services" },
  { value: "other", labelAr: "أخرى", labelEn: "Other" },
]

export default function AddAdForm({ locale }: AddAdFormProps) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [category, setCategory] = useState("")
  const [allowEscrow, setAllowEscrow] = useState(false)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [city, setCity] = useState("")
  const [area, setArea] = useState("")
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [locating, setLocating] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const isCarsOrParts = ["cars", "car-parts", "motorcycles", "motorcycle-parts"].includes(category)
  const isRealEstate = category.startsWith("real-estate")

  // Load Leaflet when map opens
  useEffect(() => {
    if (!showMap || typeof window === "undefined") return

    const ensureLeaflet = async () => {
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Leaflet failed"))
          document.body.appendChild(script)
        })
      }

      const L = (window as any).L
      if (!mapRef.current) return

      const startLat = lat ?? 30.0444
      const startLng = lng ?? 31.2357

      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }

      const map = L.map(mapRef.current).setView([startLat, startLng], lat ? 13 : 6)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map)

      const setMarker = (la: number, ln: number) => {
        if (markerRef.current) markerRef.current.remove()
        markerRef.current = L.marker([la, ln]).addTo(map)
        setLat(la)
        setLng(ln)
      }

      if (lat && lng) setMarker(lat, lng)

      map.on("click", (e: any) => {
        setMarker(e.latlng.lat, e.latlng.lng)
      })

      leafletMap.current = map
      setTimeout(() => map.invalidateSize(), 200)
    }

    ensureLeaflet().catch(() => {
      setError(isRtl ? "تعذر تحميل الخريطة" : "Could not load map")
    })

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [showMap]) // eslint-disable-line react-hooks/exhaustive-deps

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(isRtl ? "المتصفح لا يدعم تحديد الموقع" : "Geolocation not supported")
      return
    }
    setLocating(true)
    setError("")
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const la = pos.coords.latitude
        const ln = pos.coords.longitude
        setLat(la)
        setLng(ln)
        // reverse geocode (Nominatim)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${la}&lon=${ln}&accept-language=ar`,
            { headers: { "User-Agent": "AreepApp/1.0" } }
          )
          const data = await res.json()
          const a = data.address || {}
          const cityName =
            a.city || a.town || a.village || a.state || a.county || ""
          const areaName = a.suburb || a.neighbourhood || a.road || ""
          if (cityName) setCity(cityName)
          if (areaName) setArea(areaName)
        } catch {
          /* optional */
        }
        setLocating(false)
        setShowMap(true)
      },
      () => {
        setLocating(false)
        setError(isRtl ? "لم نقدر نجيب موقعك — اختَر من الخريطة" : "Location denied — pick on map")
        setShowMap(true)
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    setError("")
    try {
      for (const file of Array.from(files).slice(0, 10 - images.length)) {
        if (file.size > 2 * 1024 * 1024) {
          setError(isRtl ? "صورة أكبر من 2 ميجا — صغّرها" : "Image over 2MB")
          continue
        }
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Upload failed")
        setImages((prev) => [...prev, data.url])
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? "فشل رفع الصورة" : "Upload failed"))
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = (url: string) => setImages((prev) => prev.filter((i) => i !== url))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!city.trim()) {
      setError(isRtl ? "المدينة مطلوبة (مكان وجود السلعة)" : "City required (item location)")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr: title,
          descriptionAr: description,
          price: Number(price),
          categorySlug: category,
          city,
          area: area || null,
          latitude: lat,
          longitude: lng,
          allowEscrow,
          condition: "USED",
          images,
          videos,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (isRtl ? "فشل نشر الإعلان" : "Failed"))
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/ads`), 1200)
    } catch (err: any) {
      setError(err.message || (isRtl ? "حصل خطأ" : "Error"))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-emerald-700">
          {isRtl ? "تم نشر الإعلان بنجاح!" : "Ad published!"}
        </h2>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-5"
    >
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {isRtl ? "الفئة *" : "Category *"}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:border-emerald-500"
        >
          <option value="">{isRtl ? "اختر الفئة" : "Select category"}</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {isRtl ? c.labelAr : c.labelEn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {isRtl ? "عنوان الإعلان *" : "Title *"}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {isRtl ? "السعر (جنيه) *" : "Price (EGP) *"}
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {isRtl ? "الوصف *" : "Description *"}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:border-emerald-500"
        />
      </div>

{/* Images */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {isRtl ? "الصور" : "Photos"}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((url) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 end-1 bg-black/60 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {images.length < 10 && (
            <label
              htmlFor="ad-image-input"
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 flex flex-col items-center justify-center gap-1 text-gray-500 cursor-pointer bg-gray-50 hover:bg-emerald-50"
            >
              {uploading ? (
                <Loader2 size={22} className="animate-spin text-emerald-600" />
              ) : (
                <>
                  <ImagePlus size={22} className="text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">{isRtl ? "إضافة صورة" : "Add photo"}</span>
                </>
              )}
            </label>
          )}
        </div>
        <input
          id="ad-image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          className="sr-only"
          onChange={handleImageUpload}
          disabled={uploading}
        />
      </div>


      {/* Videos */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <Film size={18} className="text-emerald-600" />
          {isRtl ? "فيديو (اختياري)" : "Video (optional)"}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {videos.map((url) => (
            <div key={url.slice(0, 40)} className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 bg-black">
              <video src={url} className="w-full h-full object-cover" controls muted playsInline />
              <button
                type="button"
                onClick={() => setVideos((prev) => prev.filter((v) => v !== url))}
                className="absolute top-1 end-1 bg-black/60 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {videos.length < 2 && (
            <label
              htmlFor="ad-video-input"
              className="min-h-[120px] aspect-video rounded-xl border-2 border-dashed border-emerald-400 hover:border-emerald-600 flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer bg-emerald-50/50 hover:bg-emerald-50"
            >
              {uploading ? (
                <Loader2 size={28} className="animate-spin text-emerald-600" />
              ) : (
                <>
                  <Film size={32} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">{isRtl ? "إضافة فيديو" : "Add video"}</span>
                  <span className="text-[11px] text-gray-500">{isRtl ? "MP4 / WebM حتى 8 ميجا" : "MP4/WebM up to 8MB"}</span>
                </>
              )}
            </label>
          )}
        </div>
        <input
          id="ad-video-input"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          disabled={uploading}
          onChange={async (e) => {
            const files = e.target.files
            if (!files?.length) return
            setUploading(true)
            setError("")
            try {
              for (const file of Array.from(files).slice(0, 2 - videos.length)) {
                if (file.size > 8 * 1024 * 1024) {
                  setError(isRtl ? "الفيديو أكبر من 8 ميجا" : "Video over 8MB")
                  continue
                }
                const formData = new FormData()
                formData.append("file", file)
                const res = await fetch("/api/upload", { method: "POST", body: formData })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Upload failed")
                setVideos((prev) => [...prev, data.url])
              }
            } catch (err: any) {
              setError(err.message || (isRtl ? "فشل رفع الفيديو" : "Video upload failed"))
            } finally {
              setUploading(false)
              e.target.value = ""
            }
          }}
        />
        <p className="text-xs text-gray-400 mt-1">
          {isRtl ? "MP4 أو WebM — حد أقصى 8 ميجا — فيديوهان كحد أقصى" : "MP4/WebM — max 8MB — up to 2 videos"}
        </p>
      </div>

      {/* Location of the item — not necessarily seller's city */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-300">
          <MapPin size={18} />
          {isRtl ? "مكان وجود السلعة *" : "Item location *"}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {isRtl
            ? "اكتب مدينة/حي مكان السلعة، أو فعّل موقعك الحالي، أو اختَر نقطة على الخريطة (مثلاً أنت في القاهرة والسلعة في الإسكندرية)."
            : "Enter the city where the item is, use GPS, or pick on the map (e.g. you in Cairo, item in Alexandria)."}
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isRtl ? "المدينة *" : "City *"}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder={isRtl ? "مثال: الإسكندرية" : "e.g. Alexandria"}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isRtl ? "الحي / المنطقة" : "Area"}
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={isRtl ? "مثال: سموحة" : "e.g. Smouha"}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            {isRtl ? "موقعي الحالي" : "Use my location"}
          </button>
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 bg-white text-sm font-medium hover:bg-emerald-50"
          >
            <Map size={16} />
            {showMap
              ? isRtl
                ? "إخفاء الخريطة"
                : "Hide map"
              : isRtl
                ? "إضافة موقع آخر على الخريطة"
                : "Pick another location on map"}
          </button>
        </div>

        {lat != null && lng != null && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400" dir="ltr">
            📍 {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        )}

        {showMap && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {isRtl ? "اضغط على الخريطة لتحديد مكان السلعة" : "Click the map to set item location"}
            </p>
            <div
              ref={mapRef}
              className="w-full h-64 rounded-xl border border-gray-200 overflow-hidden z-0"
            />
          </div>
        )}
      </div>


      {(isCarsOrParts || isRealEstate) && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowEscrow}
              onChange={(e) => setAllowEscrow(e.target.checked)}
              className="mt-1 w-5 h-5 rounded text-emerald-600"
            />
            <div>
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <Shield size={16} />
                {isRtl ? "تفعيل نظام وسيط قريب" : "Enable Areep Escrow"}
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                {isRtl ? "حجز المبلغ حتى التسليم — التفاصيل في سياسة الوسيط" : "Funds held until delivery"}
              </p>
            </div>
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {isRtl ? "جاري النشر..." : "Publishing..."}
          </>
        ) : isRtl ? (
          "نشر الإعلان"
        ) : (
          "Publish Ad"
        )}
      </button>
    </form>
  )
}
