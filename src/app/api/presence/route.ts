import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

/**
 * Lightweight presence:
 * - Logged-in users: update User.lastActiveAt
 * - Guests: cookie areep_guest + upsert into a simple counter via Notification-less approach
 *   using raw SQL on a temp key in a JSON-less table: we store guest pings in User with phone guest_*
 *   Actually avoid creating fake users — just return registered active count + note.
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  const now = new Date()

  try {
    if (session?.id && !String(session.id).startsWith("tmp_")) {
      await db.user.update({
        where: { id: session.id },
        data: { lastActiveAt: now },
      }).catch(() => null)
    } else if (session?.phone) {
      await db.user.update({
        where: { phone: session.phone },
        data: { lastActiveAt: now },
      }).catch(() => null)
    }
  } catch {}

  return NextResponse.json({ ok: true })
}

export async function GET() {
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes
    const onlineUsers = await db.user
      .count({
        where: {
          lastActiveAt: { gte: since },
          isBanned: false,
        },
      })
      .catch(() => 0)

    const registered = await db.user.count().catch(() => 0)
    const sellers = await db.user
      .count({ where: { sellerStatus: "APPROVED" } })
      .catch(() => 0)

    return NextResponse.json({
      ok: true,
      onlineUsers,
      registered,
      sellers,
      windowMinutes: 10,
      note: "onlineUsers = accounts active in last 10 minutes (login required for accurate count)",
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, onlineUsers: 0, error: e?.message })
  }
}
