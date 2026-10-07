import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/upload
 * Images + short videos as data-URL (works on Vercel without disk).
 * Prefer small files: image ≤2MB, video ≤8MB.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const isImage = ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)
    const isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only JPEG/PNG/WebP images or MP4/WebM videos" },
        { status: 400 }
      )
    }

    const max = isVideo ? 8 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > max) {
      return NextResponse.json(
        {
          error: isVideo
            ? "الفيديو كبير (الحد الأقصى 8 ميجا)"
            : "الصورة كبيرة (الحد الأقصى 2 ميجا)",
        },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mime = file.type === "image/jpg" ? "image/jpeg" : file.type
    const url = `data:${mime};base64,${base64}`

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      kind: isVideo ? "video" : "image",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
