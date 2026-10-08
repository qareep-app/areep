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
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        trustBadge: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ ok: true, users })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, users: [] }, { status: 500 })
  }
}
