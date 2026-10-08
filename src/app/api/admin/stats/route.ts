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

    const [
      users,
      sellers,
      sellersPending,
      buyers,
      banned,
      ads,
      activeAds,
      categories,
      consultations,
      escrow,
      sellerApps,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: { in: ["SELLER", "SELLER_PRO"] } } }),
      db.user.count({ where: { role: "SELLER_PENDING" } }),
      db.user.count({ where: { role: { in: ["USER", "VISITOR"] } } }),
      db.user.count({ where: { isBanned: true } }),
      db.ad.count(),
      db.ad.count({ where: { status: "ACTIVE" } }),
      db.category.count(),
      db.legalConsultation.count().catch(() => 0),
      db.escrowDeal.count().catch(() => 0),
      db.sellerApplication.count({ where: { status: "PENDING" } }).catch(() => 0),
    ])

    const recentAds = await db.ad.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, titleAr: true, price: true, city: true, status: true, createdAt: true },
    })

    const pendingSellers = await db.sellerApplication
      .findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
      .catch(() => [])

    const recentUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        trustBadge: true,
        sellerStatus: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      stats: {
        users,
        sellers,
        sellersPending,
        buyers,
        banned,
        ads,
        activeAds,
        categories,
        consultations,
        escrow,
        sellerApps,
        pendingOrders: 0,
        pendingCommission: 0,
      },
      recentAds,
      recentUsers,
      pendingSellers,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 })
  }
}
