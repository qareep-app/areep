import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/upload
 * Converts image to base64 data-URL and returns it.
 * Stored in DB with the ad — works locally AND on Vercel (no disk).
 * Max 2MB per image for practical DB size.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP allowed" },
        { status: 400 }
      )
    }

    // 2MB max (base64 is fine for product photos at this size)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "الصورة كبيرة جداً (الحد الأقصى 2 ميجا)" },
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
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
