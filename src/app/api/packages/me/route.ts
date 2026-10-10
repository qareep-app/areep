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
    const q = await getQuotaSnapshot(userId)
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
