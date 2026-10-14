import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"

const db = prisma as any

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, rating: true, trustBadge: true } },
      },
    })

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 })
    }

    prisma.ad.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})

    return NextResponse.json({ success: true, ad })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error" }, { status: 500 })
  }
}

/** Owner or admin: update ad fields including images */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "login" }, { status: 401 })
    }
    const { id } = await params
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const ad = await db.ad.findUnique({ where: { id } })
    if (!ad) return NextResponse.json({ error: "not found" }, { status: 404 })
    if (ad.userId !== userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const data: any = {}

    if (body.status && ["ACTIVE", "PAUSED", "SOLD", "PENDING"].includes(body.status)) {
      data.status = body.status
    }
    if (typeof body.allowEscrow === "boolean") data.allowEscrow = body.allowEscrow
    if (typeof body.titleAr === "string" && body.titleAr.trim()) {
      data.titleAr = body.titleAr.trim()
      data.titleEn = (body.titleEn || body.titleAr).trim()
    }
    if (typeof body.descriptionAr === "string") {
      data.descriptionAr = body.descriptionAr
    }
    if (body.price != null && !Number.isNaN(Number(body.price))) {
      data.price = Number(body.price)
    }
    if (typeof body.city === "string") data.city = body.city
    if (typeof body.area === "string" || body.area === null) data.area = body.area
    if (typeof body.condition === "string") data.condition = body.condition
    if (Array.isArray(body.images)) {
      data.images = body.images.filter(
        (u: unknown) => typeof u === "string" && u.length > 0 && !String(u).startsWith("/uploads")
      )
    }
    if (Array.isArray(body.videos)) data.videos = body.videos
    if (body.attributes && typeof body.attributes === "object") {
      data.attributes = body.attributes
    }
    if (typeof body.categorySlug === "string") {
      const cat = await prisma.category.findUnique({ where: { slug: body.categorySlug } })
      if (cat) data.categoryId = cat.id
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 })
    }

    const updated = await db.ad.update({ where: { id }, data })
    return NextResponse.json({ success: true, ad: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "login" }, { status: 401 })
    }
    const { id } = await params
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const ad = await db.ad.findUnique({ where: { id } })
    if (!ad) return NextResponse.json({ error: "not found" }, { status: 404 })
    if (ad.userId !== userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
    await db.ad.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
