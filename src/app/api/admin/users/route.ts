import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        trustBadge: true,
        isBanned: true,
        sellerStatus: true,
        createdAt: true,
        _count: { select: { ads: true } },
      },
    })
    return NextResponse.json({ ok: true, users })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, users: [] }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, action } = body
  if (!id || !action) {
    return NextResponse.json({ error: "Missing id/action" }, { status: 400 })
  }

  try {
    if (action === "BAN" || action === "FREEZE") {
      await db.user.update({
        where: { id },
        data: { isBanned: true },
      })
      // pause all their ads
      await db.ad.updateMany({
        where: { userId: id },
        data: { status: "PAUSED" },
      }).catch(() => null)
      return NextResponse.json({ success: true })
    }
    if (action === "UNBAN") {
      await db.user.update({
        where: { id },
        data: { isBanned: false },
      })
      return NextResponse.json({ success: true })
    }
    if (action === "SUSPEND_SELLER") {
      await db.user.update({
        where: { id },
        data: { sellerStatus: "SUSPENDED" },
      })
      await db.ad.updateMany({
        where: { userId: id },
        data: { status: "PAUSED" },
      }).catch(() => null)
      return NextResponse.json({ success: true })
    }
    if (action === "APPROVE_SELLER") {
      await db.user.update({
        where: { id },
        data: { sellerStatus: "APPROVED" },
      })
      return NextResponse.json({ success: true })
    }
    if (action === "REJECT_SELLER") {
      await db.user.update({
        where: { id },
        data: { sellerStatus: "REJECTED" },
      })
      return NextResponse.json({ success: true })
    }
    if (action === "DELETE") {
      // soft approach: ban + pause ads (hard delete may break FKs)
      await db.ad.updateMany({ where: { userId: id }, data: { status: "PAUSED" } }).catch(() => null)
      await db.user.update({
        where: { id },
        data: { isBanned: true, sellerStatus: "SUSPENDED", name: "[deleted]" },
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}
