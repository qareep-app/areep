import { NextRequest, NextResponse } from "next/server"
import { getVisitorStats, pingVisitor } from "@/lib/visitors"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = await getVisitorStats()
    return NextResponse.json({ ok: true, ...stats })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      online: 0,
      today: 0,
      configured: false,
      error: String(e?.message || e).slice(0, 200),
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const sessionId = String(body.sessionId || "").slice(0, 64)
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "sessionId required" }, { status: 400 })
    }
    const stats = await pingVisitor(sessionId)
    return NextResponse.json({ ok: true, ...stats })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      online: 0,
      today: 0,
      configured: false,
      error: String(e?.message || e).slice(0, 200),
    })
  }
}
