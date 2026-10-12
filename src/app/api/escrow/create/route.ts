import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { calculateCommission } from "@/lib/commission"
import { createPaymobIntention } from "@/lib/paymob"
import { prisma } from "@/lib/prisma"

const db = prisma as any

/**
 * POST /api/escrow/create
 * body: { adId } — ينشئ الصفقة ويبدأ دفع Paymob للمشتري
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const adId = String(body.adId || "")
    let dealId = body.dealId ? String(body.dealId) : ""

    const buyerId = await resolveDbUserId({ id: session.id, phone: session.phone })

    let deal: any = null

    if (dealId) {
      deal = await db.escrowDeal.findUnique({ where: { id: dealId } })
      if (!deal || deal.buyerId !== buyerId) {
        return NextResponse.json({ error: "صفقة غير موجودة" }, { status: 404 })
      }
      if (deal.status !== "PENDING_PAYMENT") {
        return NextResponse.json({ error: "الصفقة ليست في انتظار الدفع", status: deal.status }, { status: 400 })
      }
    } else {
      if (!adId) {
        return NextResponse.json({ error: "adId أو dealId مطلوب" }, { status: 400 })
      }
      const ad = await db.ad.findUnique({
        where: { id: adId },
        include: { category: true },
      })
      if (!ad?.allowEscrow || ad.status !== "ACTIVE") {
        return NextResponse.json({ error: "الإعلان لا يدعم الوسيط أو غير نشط" }, { status: 400 })
      }
      if (ad.userId === buyerId) {
        return NextResponse.json({ error: "لا يمكن شراء إعلانك" }, { status: 400 })
      }

      const existing = await db.escrowDeal.findFirst({
        where: {
          adId,
          buyerId,
          status: { in: ["PENDING_PAYMENT", "HELD", "DELIVERED"] },
        },
      })
      if (existing) {
        deal = existing
      } else {
        const price = Number(ad.price)
        const commission = calculateCommission({
          price,
          categorySlug: ad.category?.slug,
          commissionType: ad.category?.commissionType,
          useEscrow: true,
        })
        deal = await db.escrowDeal.create({
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
      }
    }

    dealId = deal.id
    const payAmount = Number(deal.totalHeld)

    // بدون Paymob: وضع تجريبي — تعليم كـ HELD مباشرة (للتطوير فقط)
    const paymobReady = Boolean(
      process.env.PAYMOB_API_KEY?.trim() && process.env.PAYMOB_INTEGRATION_ID
    )

    if (!paymobReady) {
      return NextResponse.json({
        success: true,
        dealId,
        amount: payAmount,
        demo: true,
        message: "Paymob غير مضبوط — استخدم /api/escrow/confirm مع action=mark_paid للاختبار",
      })
    }

    const orderId = `escrow_${dealId}_${Date.now()}`
    const result = await createPaymobIntention({
      amount: payAmount,
      orderId,
      customerName: session.name || "مشتري قريب",
      customerPhone: session.phone || "01000000000",
      items: [
        {
          name: `وسيط قريب — صفقة ${dealId.slice(-6)}`,
          amount: payAmount,
          quantity: 1,
        },
      ],
    })

    await db.escrowDeal.update({
      where: { id: dealId },
      data: { paymobOrderId: orderId },
    })

    const iframeUrl =
      (result as any).iframeUrl || (result as any).iframe_url || null

    return NextResponse.json({
      success: true,
      dealId,
      amount: payAmount,
      orderId,
      iframeUrl,
      message: "انتقل لإتمام الدفع",
    })
  } catch (e: any) {
    console.error("escrow create", e)
    return NextResponse.json({ error: e?.message || "فشل" }, { status: 500 })
  }
}
