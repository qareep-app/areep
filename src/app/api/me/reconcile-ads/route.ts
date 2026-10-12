import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { prisma } from "@/lib/prisma"

const db = prisma as any

/** POST — أعد ربط كل إعلانات نفس رقم الموبايل بحساب المستخدم الحالي */
export async function POST() {
  const session = await getSession()
  if (!session?.phone) {
    return NextResponse.json({ error: "login" }, { status: 401 })
  }
  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const result = await db.ad.updateMany({
      where: {
        user: { phone: session.phone },
        userId: { not: userId },
      },
      data: { userId },
    })
    let extraCount = 0
    if (session.id !== userId) {
      const extra = await db.ad.updateMany({
        where: { userId: session.id },
        data: { userId },
      })
      extraCount = extra?.count || 0
    }
    return NextResponse.json({
      ok: true,
      moved: (result?.count || 0) + extraCount,
      userId,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
