import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

const db = prisma as any

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [users, ads, activeAds, categories, consultations, escrow] =
      await Promise.all([
        db.user.count(),
        db.ad.count(),
        db.ad.count({ where: { status: "ACTIVE" } }),
        db.category.count(),
        db.legalConsultation.count().catch(() => 0),
        db.escrowDeal.count().catch(() => 0),
      ])

    const recentAds = await db.ad.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        titleAr: true,
        price: true,
        city: true,
        status: true,
        createdAt: true,
      },
    })

    const recentUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      stats: { users, ads, activeAds, categories, consultations, escrow },
      recentAds,
      recentUsers,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 })
  }
}
