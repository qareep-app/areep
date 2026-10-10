import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [
      users,
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
      db.ad.count().catch(() => 0),
      db.ad.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      db.user.count({ where: { sellerStatus: "PENDING" } }).catch(() => 0),
      db.user.count({ where: { sellerStatus: "APPROVED" } }).catch(() => 0),
      db.user.count({ where: { isBanned: true } }).catch(() => 0),
      db.userPackage.count({ where: { isActive: true } }).catch(() => 0),
      db.escrowDeal.count().catch(() => 0),
      db.legalConsultation.count().catch(() => 0),
    ])

    // Approximate "guests online" is not tracked server-side yet; expose placeholder + registered
    return NextResponse.json({
      ok: true,
      stats: {
        users,
        registeredAccounts: users,
        sellers,
        sellersPending,
        banned,
        ads,
        activeAds,
        activePackages: packages,
        escrow,
        consultations,
        guestsOnline: null, // requires analytics/session store later
        note: "guestsOnline needs live analytics; registered counts are real",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, stats: {} }, { status: 500 })
  }
}
