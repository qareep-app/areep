import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return null
  return session
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 50), 100)
  try {
    const ads = await db.ad.findMany({
      include: {
        category: true,
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    return NextResponse.json({ success: true, ads })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, ads: [] }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
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
      await db.ad.update({ where: { id }, data: { isFeatured: true, featuredUntil: until } })
      return NextResponse.json({ success: true })
    }
    if (action === "UNFEATURE") {
      await db.ad.update({ where: { id }, data: { isFeatured: false, featuredUntil: null } })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}
