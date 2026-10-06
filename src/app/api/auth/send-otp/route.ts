import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

/**
 * POST /api/auth/send-otp
 * In production: generate OTP, save hash + expiry, send via SMS provider (Twilio / local Egyptian SMS).
 * For now: accepts any Egyptian number and returns success (OTP logged in dev).
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || !/^01[0125][0-9]{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "رقم موبايل مصري غير صحيح" },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // TODO: Save to DB or Redis
    // await prisma.oTP.create({ data: { phone, code: hash(otp), expiresAt } })

    // TODO: Send SMS
    // await sendSMS(phone, `رمز التحقق في قريب: ${otp}`)

    // Development only: log OTP
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV OTP] ${phone} => ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent",
      // Remove in production:
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    })
  } catch (error) {
    console.error("send-otp error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
