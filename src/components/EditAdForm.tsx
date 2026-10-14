"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload, X } from "lucide-react"

interface Props {
  locale: string
  adId: string
}

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

export default function EditAdForm({ locale, adId }: Props) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [titleAr, setTitleAr] = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
  const [price, setPrice] = useState("")
  const [city, setCity] = useState("")
  const [area, setArea] = useState("")
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/ads/${adId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || !d.ad) {
          setError(d.error || "not found")
          return
        }
        const a = d.ad
        setTitleAr(a.titleAr || "")
        setDescriptionAr(a.descriptionAr || "")
        setPrice(String(a.price ?? ""))
        setCity(a.city || "")
        setArea(a.area || "")
        const imgs = Array.isArray(a.images) ? a.images : []
        // drop broken local paths
        setImages(
          imgs.filter(
            (u: string) =>
              typeof u === "string" &&
              !u.startsWith("/uploads") &&
              !u.startsWith("data:")
          )
        )
      })
      .catch(() => setError("failed"))
      .finally(() => setLoading(false))
  }, [adId])

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError("")
    try {
      const next = [...images]
      for (const file of Array.from(files).slice(0, 8 - next.length)) {
        const compressed = await compressImage(file)
        const fd = new FormData()
        fd.append(
          "file",
          new File([compressed], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
          })
        )
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "upload failed")
        if (data.url) next.push(data.url)
      }
      setImages(next)
    } catch (e: any) {
      setError(e.message || "upload error")
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/ads/${adId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr,
          descriptionAr,
          price: Number(price),
          city,
          area: area || null,
          images,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "save failed")
      router.push(`/${locale}/ads/${adId}`)
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-12 text-sm flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={18} />
        {isRtl ? "جاري التحميل..." : "Loading..."}
      </p>
    )
  }

  return (
    <div className="bg-white rounded-2xl border p-5 sm:p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">
        {isRtl ? "تعديل الإعلان" : "Edit ad"}
      </h1>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium">{isRtl ? "العنوان" : "Title"}</label>
        <input
          value={titleAr}
          onChange={(e) => setTitleAr(e.target.value)}
          className="mt-1 w-full h-11 px-3 rounded-xl border"
        />
      </div>

      <div>
        <label className="text-sm font-medium">{isRtl ? "الوصف" : "Description"}</label>
        <textarea
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          rows={4}
          className="mt-1 w-full px-3 py-2 rounded-xl border"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">{isRtl ? "السعر" : "Price"}</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            className="mt-1 w-full h-11 px-3 rounded-xl border"
            dir="ltr"
          />
        </div>
        <div>
          <label className="text-sm font-medium">{isRtl ? "المدينة" : "City"}</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full h-11 px-3 rounded-xl border"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{isRtl ? "المنطقة" : "Area"}</label>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="mt-1 w-full h-11 px-3 rounded-xl border"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">
          {isRtl ? "الصور (تُرفع على Vercel Blob)" : "Images (Vercel Blob)"}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute top-0.5 end-0.5 bg-black/60 text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-emerald-300 text-emerald-700 text-sm cursor-pointer hover:bg-emerald-50">
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {isRtl ? "إضافة صور" : "Add images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={uploading || images.length >= 8}
            onChange={(e) => {
              uploadFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">
          {isRtl
            ? "الصور القديمة من /uploads اتشالت تلقائيًا — ارفع من جديد"
            : "Old /uploads paths removed — re-upload images"}
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || uploading || !titleAr || !price || !city}
          className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {isRtl ? "حفظ التعديلات" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/ads/${adId}`)}
          className="h-11 px-4 rounded-xl border font-medium"
        >
          {isRtl ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </div>
  )
}
