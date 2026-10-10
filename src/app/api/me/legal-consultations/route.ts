import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  const session = await getSession()
  if (!session?.id) {
    return NextResponse.json({ success: true, items: [] })
  }

  try {
    let userId = session.id
    if (userId.startsWith("tmp_")) {
      const u = await db.user.findUnique({ where: { phone: session.phone } }).catch(() => null)
      if (u) userId = u.id
      else return NextResponse.json({ success: true, items: [] })
    }

    const items = await db.legalConsultation
      .findMany({
        where: {
          OR: [{ clientId: userId }, { advisorId: userId }, { userId }],
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      .catch(() => [])

    return NextResponse.json({ success: true, items })
  } catch {
    return NextResponse.json({ success: true, items: [] })
  }
}
