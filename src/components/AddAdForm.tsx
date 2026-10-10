"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Shield, Loader2, X, MapPin, Navigation, Map, Film, ImagePlus } from "lucide-react"

interface AddAdFormProps {
  locale: string
}

const categories = AREEP_CATEGORIES.map((c) => ({ value: c.slug, labelAr: c.nameAr, labelEn: c.nameEn }))


/** Compress image in browser to stay under Vercel 4.5MB body limit */
async function compressImage(file: File, maxSide = 1280, quality = 0.72): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap
  if (width > maxSide || height > maxSide) {
    const ratio = Math.min(maxSide / width, maxSide / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
  )
  return blob || file
}

export default function AddAdForm({ locale }: AddAdFormProps) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [category, setCategory] = useState("")
  const [allowEscrow, setAllowEscrow] = useState(false)
  const [condition, setCondition] = useState("USED")
  const [mileage, setMileage] = useState("")
  const [transmission, setTransmission] = useState("")
  const [fuel, setFuel] = useState("")
  const [color, setColor] = useState("")
  const [year, setYear] = useState("")
  const [brand, setBrand] = useState("")
  const [importType, setImportType] = useState("") // imported | local | transfer
  const [maintenanceType, setMaintenanceType] = useState("")
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
  const isVehicle = ["cars", "motorcycles"].includes(category)
  const isRealEstate = category.startsWith("real-estate")
  const isMaintenance = category === "maintenance"

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
        const compressed = await compressImage(file)
        if (compressed.size > 1.5 * 1024 * 1024) {
          setError(isRtl ? "الصورة كبيرة حتى بعد الضغط — جرّب صورة أصغر" : "Image still too large")
          continue
        }
        const formData = new FormData()
        formData.append(
          "file",
          new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), {
            type: "image/jpeg",
          })
        )
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (res.status === 413) {
          setError(isRtl ? "الملف كبير على السيرفر — صغّر الصورة" : "File too large for server")
          continue
        }
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
          condition,
          attributes: {
            mileage: mileage || undefined,
            transmission: transmission || undefined,
            fuel: fuel || undefined,
            color: color || undefined,
            year: year || undefined,
            brand: brand || undefined,
            importType: importType || undefined,
            maintenanceType: maintenanceType || undefined,
          },
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
                  <span className="text-[11px] text-gray-500">{isRtl ? "MP4 / WebM حتى 3 ميجا" : "MP4/WebM up to 3MB"}</span>
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
                if (file.size > 3 * 1024 * 1024) {
                  setError(isRtl ? "الفيديو أكبر من 3 ميجا (حد السيرفر)" : "Video over 3MB")
                  continue
                }
                const formData = new FormData()
                formData.append("file", file)
                const res = await fetch("/api/upload", { method: "POST", body: formData })
                if (res.status === 413) {
                  setError(isRtl ? "الفيديو كبير على السيرفر — استخدم ملف أقل من 3 ميجا" : "Video too large — use under 3MB")
                  continue
                }
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
          {isRtl ? "MP4 أو WebM — حد أقصى 3 ميجا — فيديوهان كحد أقصى" : "MP4/WebM — max 3MB — up to 2 videos"}
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


      
      {isVehicle && (
        <div className="space-y-4 border rounded-xl p-4 bg-gray-50">
          <h3 className="font-semibold text-sm">{isRtl ? "تفاصيل المركبة" : "Vehicle details"}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm block">
              <span className="text-gray-600">{isRtl ? "الحالة" : "Condition"}</span>
              <div className="flex gap-2 mt-1">
                {[["USED", isRtl ? "مستعمل" : "Used"], ["NEW", isRtl ? "جديد" : "New"]].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setCondition(v)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${condition === v ? "bg-emerald-600 text-white border-emerald-600" : "bg-white"}`}>{l}</button>
                ))}
              </div>
            </label>
            <label className="text-sm block">
              <span className="text-gray-600">{isRtl ? "مستورد / تنازل" : "Import / Transfer"}</span>
              <select value={importType} onChange={(e) => setImportType(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2">
                <option value="">{isRtl ? "اختياري" : "Optional"}</option>
                <option value="local">{isRtl ? "محلي" : "Local"}</option>
                <option value="imported">{isRtl ? "مستورد" : "Imported"}</option>
                <option value="transfer">{isRtl ? "تنازل" : "Transfer"}</option>
              </select>
            </label>
            <label className="text-sm block">
              <span className="text-gray-600">{isRtl ? "العلامة / الماركة" : "Brand"}</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="Toyota" />
            </label>
            <label className="text-sm block">
              <span className="text-gray-600">{isRtl ? "سنة الصنع" : "Year"}</span>
              <input value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="2020" />
            </label>
            <label className="text-sm block">
              <span className="text-gray-600">{isRtl ? "عدد الكيلومترات" : "Mileage"}</span>
              <input value={mileage} onChange={(e) => setMileage(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="KMs" />
            </label>
            <label className="text-sm block">
              <span className="text-gray-600">{isRtl ? "ناقل الحركة" : "Transmission"}</span>
              <div className="flex gap-2 mt-1">
                {[["manual", isRtl ? "مانيوال" : "Manual"], ["auto", isRtl ? "أوتوماتيك" : "Auto"]].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setTransmission(v)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${transmission === v ? "bg-emerald-600 text-white border-emerald-600" : "bg-white"}`}>{l}</button>
                ))}
              </div>
            </label>
            <label className="text-sm block sm:col-span-2">
              <span className="text-gray-600">{isRtl ? "نوع الوقود" : "Fuel"}</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {(isRtl ? [["petrol","بنزين"],["diesel","ديزل"],["gas","غاز"],["electric","كهربائي"],["hybrid","هجين"]] : [["petrol","Petrol"],["diesel","Diesel"],["gas","Gas"],["electric","Electric"],["hybrid","Hybrid"]]).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setFuel(v)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${fuel === v ? "bg-emerald-600 text-white border-emerald-600" : "bg-white"}`}>{l}</button>
                ))}
              </div>
            </label>
            <label className="text-sm block sm:col-span-2">
              <span className="text-gray-600">{isRtl ? "اللون" : "Color"}</span>
              <input value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
            </label>
          </div>
        </div>
      )}

      {isMaintenance && (
        <label className="text-sm block border rounded-xl p-4 bg-gray-50">
          <span className="font-semibold">{isRtl ? "نوع مركز الصيانة" : "Maintenance type"}</span>
          <select value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)} className="mt-2 w-full border rounded-xl px-3 py-2" required>
            <option value="">{isRtl ? "اختر النوع" : "Select type"}</option>
            {MAINTENANCE_TYPES.map((m) => (
              <option key={m.value} value={m.value}>{isRtl ? m.ar : m.en}</option>
            ))}
          </select>
        </label>
      )}

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
