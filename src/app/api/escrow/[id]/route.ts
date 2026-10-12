import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "login" }, { status: 401 })
  }

  const { id } = await ctx.params
  const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
  const deal = await db.escrowDeal.findUnique({ where: { id } })
  if (!deal) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  if (deal.buyerId !== userId && deal.sellerId !== userId && session.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const ad = await db.ad.findUnique({
    where: { id: deal.adId },
    select: {
      id: true,
      titleAr: true,
      titleEn: true,
      images: true,
      price: true,
      city: true,
      category: { select: { slug: true, nameAr: true, commissionType: true } },
    },
  })

  const seller = await db.user.findUnique({
    where: { id: deal.sellerId },
    select: { id: true, name: true },
  }).catch(() => null)
  const buyer = await db.user.findUnique({
    where: { id: deal.buyerId },
    select: { id: true, name: true },
  }).catch(() => null)

  return NextResponse.json({
    success: true,
    deal: {
      ...deal,
      amount: Number(deal.amount),
      sellerCommission: Number(deal.sellerCommission),
      buyerCommission: Number(deal.buyerCommission),
      totalHeld: Number(deal.totalHeld),
      role: deal.buyerId === userId ? "buyer" : deal.sellerId === userId ? "seller" : "admin",
    },
    ad,
    seller,
    buyer,
  })
}
