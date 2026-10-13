import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { prisma } from "@/lib/prisma"

const db = prisma as any

async function reconcile() {
  const session = await getSession()
  if (!session?.phone) {
    return NextResponse.json({ error: "سجّل دخول أولاً", ok: false }, { status: 401 })
  }

  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    let moved = 0

    // 1) إعلانات مربوطة بمستخدمين لهم نفس رقم الموبايل
    try {
      const byPhone = await db.ad.updateMany({
        where: {
          userId: { not: userId },
          user: { phone: session.phone },
        },
        data: { userId },
      })
      moved += byPhone?.count || 0
    } catch (e) {
      console.warn("reconcile by phone relation", e)
    }

    // 2) إعلانات ما زالت على session.id القديم
    if (session.id && session.id !== userId) {
      try {
        const bySession = await db.ad.updateMany({
          where: { userId: session.id },
          data: { userId },
        })
        moved += bySession?.count || 0
      } catch (e) {
        console.warn("reconcile by session id", e)
      }
    }

    // 3) أي user صفّه phone مطابق لكن id مختلف — انقل إعلاناته
    try {
      const twins = await db.user.findMany({
        where: { phone: session.phone, id: { not: userId } },
        select: { id: true },
      })
      for (const t of twins) {
        const r = await db.ad.updateMany({
          where: { userId: t.id },
          data: { userId },
        })
        moved += r?.count || 0
      }
    } catch (e) {
      console.warn("reconcile twins", e)
    }

    const adsNow = await db.ad
      .count({
        where: {
          userId,
          status: { in: ["ACTIVE", "PAUSED", "PENDING"] },
        },
      })
      .catch(() => 0)

    const featuredNow = await db.ad
      .count({
        where: {
          userId,
          status: { in: ["ACTIVE", "PAUSED", "PENDING"] },
          isFeatured: true,
        },
      })
      .catch(() => 0)

    // حدّث عدّاد الباقة
    try {
      await db.userPackage.updateMany({
        where: { userId, isActive: true },
        data: { adsUsed: adsNow, featuredUsed: featuredNow },
      })
    } catch {}

    return NextResponse.json({
      ok: true,
      moved,
      userId,
      adsNow,
      featuredNow,
      phone: session.phone,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}

/** المتصفح يفتح GET — نفذ نفس العملية */
export async function GET() {
  return reconcile()
}

export async function POST() {
  return reconcile()
}
