import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { calculateCommission } from "@/lib/commission"
import { prisma } from "@/lib/prisma"

const db = prisma as any

/** GET — صفقات الوسيط للمستخدم الحالي */
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

    // enrich with ad titles
    const adIds = [...new Set(items.map((i: any) => i.adId))]
    const ads = adIds.length
      ? await db.ad.findMany({
          where: { id: { in: adIds } },
          select: { id: true, titleAr: true, titleEn: true, images: true, price: true },
        })
      : []
    const adMap = Object.fromEntries(ads.map((a: any) => [a.id, a]))

    return NextResponse.json({
      success: true,
      items: items.map((e: any) => ({
        ...e,
        amount: Number(e.amount),
        sellerCommission: Number(e.sellerCommission),
        buyerCommission: Number(e.buyerCommission),
        totalHeld: Number(e.totalHeld),
        ad: adMap[e.adId] || null,
        role: e.buyerId === userId ? "buyer" : "seller",
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message })
  }
}

/** POST — بدء صفقة وسيط على إعلان */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const adId = String(body.adId || "")
    if (!adId) {
      return NextResponse.json({ error: "adId مطلوب" }, { status: 400 })
    }

    const buyerId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const ad = await db.ad.findUnique({
      where: { id: adId },
      include: { category: true, user: { select: { id: true, name: true, phone: true } } },
    })
    if (!ad || ad.status !== "ACTIVE") {
      return NextResponse.json({ error: "الإعلان غير متاح" }, { status: 404 })
    }
    if (!ad.allowEscrow) {
      return NextResponse.json(
        { error: "البائع لم يفعّل وسيط قريب على هذا الإعلان" },
        { status: 400 }
      )
    }
    if (ad.userId === buyerId) {
      return NextResponse.json({ error: "لا يمكن شراء إعلانك" }, { status: 400 })
    }

    // existing open deal?
    const existing = await db.escrowDeal.findFirst({
      where: {
        adId,
        buyerId,
        status: { in: ["PENDING_PAYMENT", "HELD", "DELIVERED"] },
      },
    })
    if (existing) {
      return NextResponse.json({
        success: true,
        deal: existing,
        alreadyExists: true,
        message: "لديك صفقة مفتوحة على هذا الإعلان",
      })
    }

    const price = Number(ad.price)
    const commission = calculateCommission({
      price,
      categorySlug: ad.category?.slug,
      commissionType: ad.category?.commissionType,
      useEscrow: true,
    })

    const deal = await db.escrowDeal.create({
      data: {
        adId,
        sellerId: ad.userId,
        buyerId,
        amount: price,
        sellerCommission: commission.sellerAmount,
        buyerCommission: commission.buyerAmount,
        totalHeld: commission.buyerPaysTotal,
        status: "PENDING_PAYMENT",
        notes: commission.noteAr,
      },
    })

    return NextResponse.json({
      success: true,
      deal: {
        ...deal,
        amount: Number(deal.amount),
        sellerCommission: Number(deal.sellerCommission),
        buyerCommission: Number(deal.buyerCommission),
        totalHeld: Number(deal.totalHeld),
      },
      commission,
      ad: {
        id: ad.id,
        titleAr: ad.titleAr,
        titleEn: ad.titleEn,
      },
    })
  } catch (e: any) {
    console.error("escrow POST", e)
    return NextResponse.json({ error: e?.message || "فشل إنشاء الصفقة" }, { status: 500 })
  }
}
