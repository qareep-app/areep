import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ items: [] })

  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const items = await db.escrowDeal.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    const adIds = [...new Set(items.map((i: any) => i.adId))]
    const ads = adIds.length
      ? await db.ad.findMany({
          where: { id: { in: adIds } },
          select: { id: true, titleAr: true, titleEn: true, images: true },
        })
      : []
    const map = Object.fromEntries(ads.map((a: any) => [a.id, a]))

    return NextResponse.json({
      items: items.map((e: any) => ({
        ...e,
        amount: Number(e.amount),
        sellerCommission: Number(e.sellerCommission),
        buyerCommission: Number(e.buyerCommission),
        totalHeld: Number(e.totalHeld),
        commission: Number(e.sellerCommission) + Number(e.buyerCommission),
        ad: map[e.adId] || null,
        titleAr: map[e.adId]?.titleAr,
        role: e.buyerId === userId ? "buyer" : "seller",
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message })
  }
}
