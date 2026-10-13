import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { isAdminPhone } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

const db = prisma as any

/** تشخيص: ليه العداد صفر؟ */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "login required" }, { status: 401 })
  }

  const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
  const isAdmin = isAdminPhone(session.phone)

  const mineById = await db.ad
    .findMany({
      where: { userId },
      select: {
        id: true,
        titleAr: true,
        status: true,
        isFeatured: true,
        userId: true,
        createdAt: true,
      },
      take: 20,
    })
    .catch(() => [])

  const mineByPhone = session.phone
    ? await db.ad
        .findMany({
          where: { user: { phone: session.phone } },
          select: {
            id: true,
            titleAr: true,
            status: true,
            isFeatured: true,
            userId: true,
          },
          take: 20,
        })
        .catch(() => [])
    : []

  let sampleAll: any[] = []
  if (isAdmin) {
    sampleAll = await db.ad
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          titleAr: true,
          status: true,
          isFeatured: true,
          userId: true,
          user: { select: { id: true, phone: true, name: true } },
        },
      })
      .catch(() => [])
  }

  return NextResponse.json({
    sessionId: session.id,
    resolvedUserId: userId,
    phone: session.phone,
    isAdmin,
    countByUserId: mineById.length,
    countByPhone: mineByPhone.length,
    mineById,
    mineByPhone,
    sampleAllAds: sampleAll,
  })
}
