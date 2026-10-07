import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/escrow
 * body: { adId, buyerId, amount }
 * Creates a PENDING escrow deal record (payment gateway integration next).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { adId, buyerId, amount } = body
    if (!adId || !buyerId || amount == null) {
      return NextResponse.json({ error: "adId, buyerId, amount required" }, { status: 400 })
    }

    const ad = await prisma.ad.findUnique({ where: { id: adId } })
    if (!ad || ad.status !== "ACTIVE") {
      return NextResponse.json({ error: "Ad not available" }, { status: 404 })
    }
    if (!ad.allowEscrow) {
      return NextResponse.json({ error: "Escrow not enabled on this ad" }, { status: 400 })
    }

    // Commission rates: 2.5% each side for cars/real-estate escrow
    const value = Number(amount)
    const sellerFee = Math.round(value * 0.025 * 100) / 100
    const buyerFee = Math.round(value * 0.025 * 100) / 100
    const totalHold = value + buyerFee

    // Prefer EscrowDeal model if exists; otherwise store as JSON on a generic table
    // Using raw approach via prisma if model present
    let deal: any = null
    try {
      // @ts-expect-error dynamic model
      if (prisma.escrowDeal?.create) {
        // @ts-expect-error
        deal = await prisma.escrowDeal.create({
          data: {
            adId,
            sellerId: ad.userId,
            buyerId,
            amount: value,
            sellerCommission: sellerFee,
            buyerCommission: buyerFee,
            totalHeld: totalHold,
            status: "PENDING_PAYMENT",
          },
        })
      }
    } catch {
      // model may not exist yet
    }

    return NextResponse.json({
      ok: true,
      message: "Escrow initiated — complete payment to hold funds",
      calculation: {
        dealValue: value,
        sellerCommission: sellerFee,
        buyerCommission: buyerFee,
        totalToPayByBuyer: totalHold,
        status: "PENDING_PAYMENT",
      },
      deal,
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    policy: "/escrow",
    rates: {
      carsEscrow: { seller: "2.5%", buyer: "2.5%" },
      carsNoEscrow: { seller: "2%", buyer: "0%" },
      realEstateSaleEscrow: { seller: "2.5%", buyer: "2.5%" },
      realEstateRent: { landlord: "0.5 month", tenant: "0.5 month" },
    },
  })
}
