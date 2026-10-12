import { NextResponse } from "next/server"
import {
  getSession,
  attachSessionCookies,
  clearSessionOnResponse,
} from "@/lib/session"
import { isAdminPhone } from "@/lib/admin"
import { resolveDbUserId } from "@/lib/packages"
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
  }

  // Resolve real DB user id (tmp_ sessions)
  try {
    const dbId = await resolveDbUserId({ id: session.id, phone: session.phone })
    session = { ...session, id: dbId }
  } catch {}

  const res = NextResponse.json({
    user: session,
    adminPhonesConfigured: Boolean(process.env.ADMIN_PHONES?.trim()),
  })
  if (isAdminPhone(session.phone)) {
    return attachSessionCookies(res, session)
  }
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  return clearSessionOnResponse(res)
}
