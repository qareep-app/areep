import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "nodejs"

/**
 * Upload to Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
 * Falls back to data-URL only in local/dev without token (not for production).
 * Vercel serverless body limit ~4.5MB — keep files small.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const isImage = ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
      file.type
    )
    const isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only JPEG/PNG/WebP images or MP4/WebM videos" },
        { status: 400 }
      )
    }

    const max = isVideo ? 3 * 1024 * 1024 : 1.5 * 1024 * 1024
    if (file.size > max) {
      return NextResponse.json(
        {
          error: isVideo
            ? "الفيديو كبير (الحد الأقصى 3 ميجا)"
            : "الصورة كبيرة (الحد الأقصى 1.5 ميجا بعد الضغط)",
        },
        { status: 413 }
      )
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "video/webm"
            ? "webm"
            : file.type === "video/mp4" || file.type === "video/quicktime"
              ? "mp4"
              : "jpg"

    const safeName = (file.name || "file")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80)
    const pathname = `areep/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}.${ext}`

    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (token) {
      const blob = await put(pathname, file, {
        access: "public",
        token,
        contentType: file.type === "image/jpg" ? "image/jpeg" : file.type,
        addRandomSuffix: false,
      })

      return NextResponse.json({
        success: true,
        url: blob.url,
        pathname: blob.pathname,
        filename: file.name,
        kind: isVideo ? "video" : "image",
        storage: "vercel-blob",
      })
    }

    // Dev fallback only — not durable on serverless without Blob
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN غير مضبوط على Vercel — أضف Vercel Blob من لوحة المشروع",
        },
        { status: 503 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mime = file.type === "image/jpg" ? "image/jpeg" : file.type
    const url = `data:${mime};base64,${buffer.toString("base64")}`

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      kind: isVideo ? "video" : "image",
      storage: "data-url-dev",
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    const msg = String(error?.message || "")
    if (msg.includes("too large") || msg.includes("413")) {
      return NextResponse.json({ error: "الملف كبير جداً" }, { status: 413 })
    }
    return NextResponse.json(
      { error: msg || "Upload failed" },
      { status: 500 }
    )
  }
}
