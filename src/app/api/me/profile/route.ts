import { NextRequest, NextResponse } from "next/server"
import { getSession, attachSessionCookies } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const name = String(body.name || "").trim().slice(0, 80)

  try {
    let userId = session.id
    if (userId.startsWith("tmp_")) {
      const u = await db.user.findUnique({ where: { phone: session.phone } })
      if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 })
      userId = u.id
    }
    const user = await db.user.update({
      where: { id: userId },
      data: { name: name || null },
    })
    const sessionUser = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    }
    const res = NextResponse.json({ success: true, user: sessionUser })
    return attachSessionCookies(res, sessionUser)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
