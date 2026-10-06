import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/contracts/sign
 * 1. Receive signature image (base64 or uploaded URL)
 * 2. Generate & send OTP to user's phone
 * 3. After OTP verification → save signature + mark party as signed
 * 4. If both parties signed → send to legal consultant
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { contractId, userId, signatureImageUrl, otp, action } = body

    if (!contractId || !userId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    if (action === "request_otp") {
      if (!signatureImageUrl) {
        return NextResponse.json({ error: "Signature image required" }, { status: 400 })
      }
      // TODO:
      // - Save temporary signature
      // - Generate 6-digit OTP
      // - Send SMS via provider
      // - Store OTP hash with expiry (5 min)
      return NextResponse.json({
        success: true,
        message: "OTP sent to registered phone",
        // In production never return the OTP
      })
    }

    if (action === "verify_otp") {
      if (!otp) {
        return NextResponse.json({ error: "OTP required" }, { status: 400 })
      }
      // TODO:
      // - Verify OTP
      // - Save Signature record linked to Contract + User
      // - Update contract status
      // - If both signed → status = PENDING_LEGAL + notify consultant
      return NextResponse.json({
        success: true,
        message: "Signature verified and recorded",
        newStatus: "PENDING_LEGAL",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Contract sign error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
