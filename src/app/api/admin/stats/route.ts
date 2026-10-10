import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { presenceCount, upstashConfigured } from "@/lib/upstash"

const db = prisma as any

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const since = new Date(Date.now() - 10 * 60 * 1000)
    const visitorsOnline = await presenceCount().catch(() => null)
    const [
      users,
      onlineUsers,
      ads,
      activeAds,
      sellersPending,
      sellers,
      banned,
      packages,
      escrow,
      consultations,
    ] = await Promise.all([
      db.user.count().catch(() => 0),
      db.user.count({ where: { lastActiveAt: { gte: since }, isBanned: false } }).catch(() => 0),
      db.ad.count().catch(() => 0),
      db.ad.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      db.user.count({ where: { sellerStatus: "PENDING" } }).catch(() => 0),
      db.user.count({ where: { sellerStatus: "APPROVED" } }).catch(() => 0),
      db.user.count({ where: { isBanned: true } }).catch(() => 0),
      db.userPackage.count({ where: { isActive: true } }).catch(() => 0),
      db.escrowDeal.count().catch(() => 0),
      db.legalConsultation.count().catch(() => 0),
    ])

    return NextResponse.json({
      ok: true,
      stats: {
        users,
        onlineUsers,
        registeredAccounts: users,
        sellers,
        sellersPending,
        banned,
        ads,
        activeAds,
        activePackages: packages,
        escrow,
        consultations,
        guestsOnline: visitorsOnline,
        visitorsOnline,
        upstash: upstashConfigured(),
        note: "onlineUsers = logged-in accounts active in last 10 minutes",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, stats: {} }, { status: 500 })
  }
}
