"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Shield, Loader2, X } from "lucide-react"

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
  { value: "other", labelAr: "أخرى", labelEn: "Other" },
]

export default function AddAdForm({ locale }: AddAdFormProps) {
  const isRtl = locale === "ar"
  const router = useRouter()

  const [category, setCategory] = useState("")
  const [allowEscrow, setAllowEscrow] = useState(false)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [city, setCity] = useState("")
  const [area, setArea] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const isCarsOrParts = ["cars", "car-parts", "motorcycles", "motorcycle-parts"].includes(category)
  const isRealEstate = category.startsWith("real-estate")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    setError("")

    try {
      for (const file of Array.from(files).slice(0, 10 - images.length)) {
        if (file.size > 2 * 1024 * 1024) {
          setError(isRtl ? "صورة أكبر من 2 ميجا — صغّرها" : "Image over 2MB — please compress")
          continue
        }
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
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

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((i) => i !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
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
          allowEscrow,
          condition: "USED",
          images,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || (isRtl ? "فشل نشر الإعلان" : "Failed to publish"))

      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/ads`), 1200)
    } catch (err: any) {
      setError(err.message || (isRtl ? "حصل خطأ" : "Something went wrong"))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-emerald-700 mb-2">
          {isRtl ? "تم نشر الإعلان بنجاح!" : "Ad published successfully!"}
        </h2>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
      {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{isRtl ? "الفئة *" : "Category *"}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required
          className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-500 outline-none">
          <option value="">{isRtl ? "اختر الفئة" : "Select category"}</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{isRtl ? c.labelAr : c.labelEn}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{isRtl ? "عنوان الإعلان *" : "Ad Title *"}</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-500 outline-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{isRtl ? "السعر (جنيه) *" : "Price (EGP) *"}</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0"
          className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-500 outline-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{isRtl ? "الوصف *" : "Description *"}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-500 outline-none resize-none" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{isRtl ? "المدينة *" : "City *"}</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{isRtl ? "الحي" : "Area"}</label>
          <input type="text" value={area} onChange={(e) => setArea(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-emerald-500 outline-none" />
        </div>
      </div>

      {/* Images - label/htmlFor is the reliable way to open file picker */}
      <div>
        <div className="block text-sm font-semibold text-gray-700 mb-2">
          {isRtl ? "الصور" : "Images"} ({images.length}/10)
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
          {images.map((url) => (
            <div key={url.slice(0, 64)} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {images.length < 10 && (
            <label
              htmlFor="ad-image-input"
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 flex flex-col items-center justify-center gap-1 text-gray-500 cursor-pointer transition bg-gray-50 hover:bg-emerald-50"
            >
              {uploading ? (
                <Loader2 size={22} className="animate-spin text-emerald-600" />
              ) : (
                <>
                  <Upload size={22} />
                  <span className="text-xs font-medium">{isRtl ? "إضافة صورة" : "Add photo"}</span>
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
        <p className="text-xs text-gray-400 mt-1">
          {isRtl ? "JPEG أو PNG أو WebP — حد أقصى 2 ميجا للصورة" : "JPEG, PNG or WebP — max 2MB each"}
        </p>
      </div>

      {(isCarsOrParts || isRealEstate) && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={allowEscrow} onChange={(e) => setAllowEscrow(e.target.checked)}
              className="mt-1 w-5 h-5 rounded text-emerald-600" />
            <div>
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <Shield size={16} />
                {isRtl ? "تفعيل نظام وسيط قريب" : "Enable Areep Escrow"}
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                {isRtl ? "حماية الفلوس + عمولة حسب الفئة" : "Money protection + category commission"}
              </p>
            </div>
          </label>
        </div>
      )}

      <button type="submit" disabled={loading || uploading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition">
        {loading ? (
          <><Loader2 size={18} className="animate-spin" />{isRtl ? "جاري النشر..." : "Publishing..."}</>
        ) : (
          isRtl ? "نشر الإعلان" : "Publish Ad"
        )}
      </button>
    </form>
  )
}
