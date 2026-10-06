import { NextRequest, NextResponse } from "next/server"
import { calculateCommission, type CommissionType } from "@/lib/commission"

/**
 * POST /api/escrow/create
 * Creates a new escrow transaction and returns payment details.
 * Commission is calculated server-side only (never trust client).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      adId,
      amount,
      commissionType,
      useEscrow = true,
      monthlyRent,
      buyerId,
      sellerId,
    } = body

    // Validate required fields
    if (!adId || !amount || !commissionType || !buyerId || !sellerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Server-side commission calculation (source of truth)
    const commission = calculateCommission({
      amount: Number(amount),
      commissionType: commissionType as CommissionType,
      useEscrow: Boolean(useEscrow),
      monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
    })

    // TODO: Create Transaction record in database with status PENDING
    // const transaction = await prisma.transaction.create({ ... })

    // TODO: Create Paymob Intention
    // const paymobIntention = await createPaymobIntention({
    //   amount: commission.buyerPaysTotal * 100, // in cents
    //   ...
    // })

    // Mock response for now
    const mockTransactionId = `txn_${Date.now()}`

    return NextResponse.json({
      success: true,
      transactionId: mockTransactionId,
      commission: {
        sellerCommission: commission.sellerCommission,
        buyerCommission: commission.buyerCommission,
        platformFee: commission.platformFee,
        legalFee: commission.legalFee,
        sellerReceives: commission.sellerReceives,
        buyerPaysTotal: commission.buyerPaysTotal,
        rule: commission.breakdown.rule,
      },
      // paymentUrl: paymobIntention.payment_url, // when Paymob is connected
      paymentUrl: null,
      message: "Escrow created. Connect Paymob keys to enable real payments.",
    })
  } catch (error) {
    console.error("Escrow create error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
