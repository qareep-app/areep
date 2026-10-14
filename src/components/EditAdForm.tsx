"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload, X, Film } from "lucide-react"

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

function isUsableMediaUrl(u: unknown): u is string {
  return (
    typeof u === "string" &&
    u.length > 0 &&
    u.length < 2000 &&
    !u.startsWith("data:") &&
    !u.startsWith("/uploads")
  )
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
  const [videos, setVideos] = useState<string[]>([])
  const [hadBadVideo, setHadBadVideo] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

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
        const vids = Array.isArray(a.videos) ? a.videos : []
        setImages(imgs.filter(isUsableMediaUrl))
        const badVid = vids.some(
          (u: string) => typeof u === "string" && (u.startsWith("data:") || u.startsWith("/uploads"))
        )
        setHadBadVideo(badVid)
        setVideos(vids.filter(isUsableMediaUrl))
        setIsFeatured(Boolean(a.isFeatured))
      })
      .catch(() => setError("failed"))
      .finally(() => setLoading(false))
  }, [adId])

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError("")
    try {
      const next = [...images]
      for (const file of Array.from(files).slice(0, 8 - next.length)) {
        if (!file.type.startsWith("image/")) continue
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

  const uploadVideos = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError("")
    try {
      const next = [...videos]
      for (const file of Array.from(files).slice(0, 2 - next.length)) {
        if (!file.type.startsWith("video/")) continue
        if (file.size > 3 * 1024 * 1024) {
          throw new Error(isRtl ? "الفيديو أكبر من 3 ميجا" : "Video max 3MB")
        }
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "upload failed")
        if (data.url && !String(data.url).startsWith("data:")) {
          next.push(data.url)
        } else {
          throw new Error(
            isRtl
              ? "الرفع لم يرجع رابط Blob — تأكد من BLOB_READ_WRITE_TOKEN"
              : "Upload did not return Blob URL"
          )
        }
      }
      setVideos(next)
      setHadBadVideo(false)
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
          videos,
          isFeatured,
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

      {hadBadVideo && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          {isRtl
            ? "كان في فيديو قديم (base64) واتشال عشان يبطّئ الموقع. ارفع فيديو جديد من هنا (حد أقصى 3 ميجا)."
            : "An old base64 video was removed. Re-upload a video here (max 3MB)."}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="w-4 h-4 rounded text-emerald-600"
        />
        <span>
          {isRtl
            ? "إعلان مميز (من حصة الباقة — مش تلقائي)"
            : "Featured ad (uses package quota — not automatic)"}
        </span>
      </label>

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

      {/* Images */}
      <div>
        <label className="text-sm font-medium block mb-2">
          {isRtl ? "الصور (Vercel Blob)" : "Images (Vercel Blob)"}
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
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isRtl ? "إضافة صور" : "Add images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={uploading || images.length >= 8}
            onChange={(e) => {
              uploadImages(e.target.files)
              e.target.value = ""
            }}
          />
        </label>
      </div>

      {/* Videos */}
      <div>
        <label className="text-sm font-medium block mb-2">
          {isRtl ? "الفيديو (Vercel Blob — حد 3 ميجا)" : "Video (Vercel Blob — max 3MB)"}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {videos.map((src, i) => (
            <div key={i} className="relative w-full max-w-xs rounded-lg overflow-hidden bg-gray-100 border">
              <video src={src} controls className="w-full max-h-40" />
              <button
                type="button"
                onClick={() => setVideos(videos.filter((_, j) => j !== i))}
                className="absolute top-1 end-1 bg-black/60 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-sky-300 text-sky-800 text-sm cursor-pointer hover:bg-sky-50">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Film size={16} />}
          {isRtl ? "إضافة فيديو" : "Add video"}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            disabled={uploading || videos.length >= 2}
            onChange={(e) => {
              uploadVideos(e.target.files)
              e.target.value = ""
            }}
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">
          {isRtl
            ? "اضغط حفظ بعد الرفع عشان يتمسح الفيديو القديم من قاعدة البيانات"
            : "Save after upload to clear old base64 video from the database"}
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
