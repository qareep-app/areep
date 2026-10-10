import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  const session = await getSession()
  if (!session?.id) {
    return NextResponse.json({ ok: false, error: "login required" }, { status: 401 })
  }

  try {
    let userId = session.id
    if (String(userId).startsWith("tmp_") && session.phone) {
      const u = await db.user.findUnique({ where: { phone: session.phone } })
      if (u) userId = u.id
    }

    const active = await db.userPackage.findFirst({
      where: { userId, isActive: true, endDate: { gte: new Date() } },
      include: { package: true },
      orderBy: { endDate: "desc" },
    })

    if (!active) {
      return NextResponse.json({
        ok: true,
        active: null,
        quota: {
          slug: "free",
          nameAr: "مجانية",
          nameEn: "Free",
          maxAds: 5,
          adsUsed: 0,
          adsRemaining: 5,
          featuredAds: 0,
          featuredUsed: 0,
          featuredRemaining: 0,
          endDate: null,
        },
      })
    }

    const maxAds = active.package?.maxAds
    const featuredAds = active.package?.featuredAds ?? 0
    const adsUsed = active.adsUsed ?? 0
    const featuredUsed = active.featuredUsed ?? 0

    return NextResponse.json({
      ok: true,
      active,
      quota: {
        slug: active.package?.slug || "unknown",
        nameAr: active.package?.nameAr || active.package?.slug,
        nameEn: active.package?.nameEn || active.package?.slug,
        maxAds: maxAds,
        adsUsed,
        adsRemaining: maxAds == null ? null : Math.max(0, maxAds - adsUsed),
        featuredAds,
        featuredUsed,
        featuredRemaining: Math.max(0, featuredAds - featuredUsed),
        endDate: active.endDate,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
