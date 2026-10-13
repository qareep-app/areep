import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getQuotaSnapshot, resolveDbUserId, PACKAGE_META } from "@/lib/packages"

export async function GET() {
  const session = await getSession()
  if (!session?.id) {
    return NextResponse.json({ ok: false, error: "login required" }, { status: 401 })
  }

  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })

    // Auto re-link ads that belong to same phone under other user rows
    try {
      const { prisma } = await import("@/lib/prisma")
      const db = prisma as any
      if (session.phone) {
        const twins = await db.user.findMany({
          where: { phone: session.phone, id: { not: userId } },
          select: { id: true },
        })
        for (const t of twins) {
          await db.ad.updateMany({ where: { userId: t.id }, data: { userId } })
        }
        if (session.id !== userId) {
          await db.ad.updateMany({ where: { userId: session.id }, data: { userId } })
        }
      }
    } catch (e) {
      console.warn("packages/me auto-reconcile", e)
    }

    const q = await getQuotaSnapshot(userId, session.phone)
    const meta = PACKAGE_META[q.slug] || PACKAGE_META.free

    return NextResponse.json({
      ok: true,
      quota: {
        slug: q.slug,
        nameAr: meta.nameAr,
        nameEn: meta.nameEn,
        maxAds: q.maxAds,
        adsUsed: q.adsUsed,
        adsRemaining: q.adsRemaining,
        featuredAds: q.featuredAds,
        featuredUsed: q.featuredUsed,
        featuredRemaining: q.featuredRemaining,
        endDate: q.endDate,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
