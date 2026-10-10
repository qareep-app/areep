import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { presenceCount, presencePing, upstashConfigured } from "@/lib/upstash"

const db = prisma as any

function getOrCreateVisitorId(req: NextRequest): { id: string; setCookie: boolean } {
  const existing = req.cookies.get("areep_vid")?.value
  if (existing && existing.length >= 8) return { id: existing, setCookie: false }
  const id = `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  return { id, setCookie: true }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const now = new Date()
  const { id: vid, setCookie } = getOrCreateVisitorId(req)

  try {
    if (session?.id && !String(session.id).startsWith("tmp_")) {
      await db.user
        .update({ where: { id: session.id }, data: { lastActiveAt: now } })
        .catch(() => null)
      await presencePing(`u_${session.id}`)
    } else if (session?.phone) {
      await db.user
        .update({ where: { phone: session.phone }, data: { lastActiveAt: now } })
        .catch(() => null)
      await presencePing(`p_${session.phone}`)
    } else {
      await presencePing(vid)
    }
  } catch {}

  const res = NextResponse.json({
    ok: true,
    upstash: upstashConfigured(),
  })
  if (setCookie) {
    res.cookies.set("areep_vid", vid, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: true,
    })
  }
  return res
}

export async function GET() {
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000)
    const onlineUsers = await db.user
      .count({
        where: { lastActiveAt: { gte: since }, isBanned: false },
      })
      .catch(() => 0)

    const upstashOnline = await presenceCount()

    return NextResponse.json({
      ok: true,
      onlineUsers,
      visitorsOnline: upstashOnline,
      upstash: upstashConfigured(),
      windowMinutes: 10,
      note: upstashConfigured()
        ? "visitorsOnline includes guests via Upstash (last 10 min)"
        : "Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for real guest visitor counts",
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, onlineUsers: 0, error: e?.message })
  }
}
