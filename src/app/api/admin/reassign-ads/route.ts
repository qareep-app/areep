import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

const db = prisma as any

/**
 * POST { phone: "010...", adIds?: string[], claimAll?: true }
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const phone = String(body.phone || "").trim()
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 })
  }

  const user = await db.user.upsert({
    where: { phone },
    update: {},
    create: { phone, role: "USER", name: body.name || null },
  })

  let adIds: string[] = Array.isArray(body.adIds) ? body.adIds.map(String) : []

  if (!adIds.length && body.claimAll === true) {
    const all = await db.ad.findMany({
      select: { id: true },
      orderBy: { createdAt: "desc" },
      take: Number(body.limit || 50),
    })
    adIds = all.map((a: any) => a.id)
  }

  if (!adIds.length) {
    return NextResponse.json(
      {
        error: "أرسل adIds أو claimAll: true",
        tip: "GET /api/admin/reassign-ads لعرض الإعلانات",
      },
      { status: 400 }
    )
  }

  const result = await db.ad.updateMany({
    where: { id: { in: adIds } },
    data: { userId: user.id },
  })

  const adsNow = await db.ad.count({
    where: {
      userId: user.id,
      status: { in: ["ACTIVE", "PAUSED", "PENDING"] },
    },
  })
  const featuredNow = await db.ad.count({
    where: {
      userId: user.id,
      status: { in: ["ACTIVE", "PAUSED", "PENDING"] },
      isFeatured: true,
    },
  })

  await db.userPackage
    .updateMany({
      where: { userId: user.id, isActive: true },
      data: { adsUsed: adsNow, featuredUsed: featuredNow },
    })
    .catch(() => null)

  return NextResponse.json({
    ok: true,
    phone,
    userId: user.id,
    updated: result.count,
    adsNow,
    featuredNow,
  })
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const ads = await db.ad.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      titleAr: true,
      status: true,
      isFeatured: true,
      userId: true,
      user: { select: { phone: true, name: true } },
    },
  })
  return NextResponse.json({ ok: true, ads })
}
