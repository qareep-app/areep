import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Vercel serverless body limit ~4.5MB — keep files small.
 * Images should be compressed on the client first.
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

    // Hard limits under Vercel body size
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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    // Extra safety: base64 expands ~33%
    if (buffer.length > 3.2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "الملف كبير على السيرفر — صغّره" },
        { status: 413 }
      )
    }

    const base64 = buffer.toString("base64")
    const mime = file.type === "image/jpg" ? "image/jpeg" : file.type
    const url = `data:${mime};base64,${base64}`

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      kind: isVideo ? "video" : "image",
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    const msg = String(error?.message || "")
    if (msg.includes("too large") || msg.includes("413")) {
      return NextResponse.json({ error: "الملف كبير جداً" }, { status: 413 })
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
