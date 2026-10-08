import { NextResponse } from "next/server"
import {
  getSession,
  attachSessionCookies,
  clearSessionOnResponse,
} from "@/lib/session"
import { isAdminPhone } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  let session = await getSession()

  if (!session) {
    return NextResponse.json({
      user: null,
      adminPhonesConfigured: Boolean(process.env.ADMIN_PHONES?.trim()),
    })
  }

  if (isAdminPhone(session.phone) && session.role !== "ADMIN") {
    try {
      await db.user.updateMany({
        where: { phone: session.phone },
        data: { role: "ADMIN" },
      })
    } catch {}
    session = { ...session, role: "ADMIN" }
    const res = NextResponse.json({
      user: session,
      adminPhonesConfigured: true,
    })
    return attachSessionCookies(res, session)
  }

  return NextResponse.json({
    user: session,
    adminPhonesConfigured: Boolean(process.env.ADMIN_PHONES?.trim()),
  })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  return clearSessionOnResponse(res)
}
