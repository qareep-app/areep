import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/escrow/confirm
 * Actions: confirm_delivery (seller) | confirm_receipt (buyer)
 * On confirm_receipt → release funds to seller after commission deduction.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transactionId, action, userId } = body

    if (!transactionId || !action || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    if (!["confirm_delivery", "confirm_receipt"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // TODO:
    // 1. Load transaction from DB
    // 2. Verify user is the correct party (seller/buyer)
    // 3. Update status
    // 4. If confirm_receipt → 
    //    - Calculate final amounts using calculateCommission (again for safety)
    //    - Trigger Paymob payout / bank transfer to seller
    //    - Mark COMPLETED
    //    - Send notifications

    return NextResponse.json({
      success: true,
      transactionId,
      newStatus: action === "confirm_delivery" ? "DELIVERED" : "COMPLETED",
      message:
        action === "confirm_receipt"
          ? "Funds will be released to seller after commission deduction"
          : "Delivery confirmed, waiting for buyer confirmation",
    })
  } catch (error) {
    console.error("Escrow confirm error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
