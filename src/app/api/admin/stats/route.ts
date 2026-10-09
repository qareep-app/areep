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
    const [users, ads, sellersPending, packages] = await Promise.all([
      db.user.count().catch(() => 0),
      db.ad.count().catch(() => 0),
      db.user.count({ where: { sellerStatus: "PENDING" } }).catch(() => 0),
      db.userPackage.count({ where: { isActive: true } }).catch(() => 0),
    ])

    return NextResponse.json({
      ok: true,
      stats: {
        users,
        ads,
        sellersPending,
        activePackages: packages,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, stats: {} }, { status: 500 })
  }
}
