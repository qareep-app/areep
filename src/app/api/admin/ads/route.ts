import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized", ads: [] }, { status: 401 })
  }

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 80), 100)

  try {
    const ads = await db.ad.findMany({
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        price: true,
        currency: true,
        status: true,
        isFeatured: true,
        views: true,
        city: true,
        area: true,
        images: true,
        createdAt: true,
        userId: true,
        category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    return NextResponse.json({ success: true, ads: ads || [] })
  } catch (e: any) {
    console.error("admin/ads GET", e)
    // fallback بدون relations
    try {
      const ads = await db.ad.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      })
      return NextResponse.json({
        success: true,
        ads: ads || [],
        warning: e?.message || "relations failed",
      })
    } catch (e2: any) {
      return NextResponse.json(
        { error: e2?.message || e?.message || "DB error", ads: [] },
        { status: 500 }
      )
    }
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, action } = body
  if (!id || !action) {
    return NextResponse.json({ error: "Missing id/action" }, { status: 400 })
  }
  try {
    if (action === "DELETE") {
      await db.ad.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }
    if (action === "PAUSE") {
      await db.ad.update({ where: { id }, data: { status: "PAUSED" } })
      return NextResponse.json({ success: true })
    }
    if (action === "ACTIVATE") {
      await db.ad.update({ where: { id }, data: { status: "ACTIVE" } })
      return NextResponse.json({ success: true })
    }
    if (action === "FEATURE") {
      const until = new Date()
      until.setDate(until.getDate() + 30)
      await db.ad.update({
        where: { id },
        data: { isFeatured: true, featuredUntil: until },
      })
      return NextResponse.json({ success: true })
    }
    if (action === "UNFEATURE") {
      await db.ad.update({
        where: { id },
        data: { isFeatured: false, featuredUntil: null },
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}
