import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

/**
 * POST /api/auth/verify-otp
 * Verifies OTP and returns a simple session token + user object.
 * In production: use JWT or iron-session / next-auth.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: "Missing phone or otp" }, { status: 400 })
    }

    // TODO: Verify against DB/Redis
    // const record = await prisma.oTP.findFirst({ where: { phone, expiresAt: { gt: new Date() } } })
    // if (!record || !verifyHash(otp, record.code)) return 401

    // For development: accept any 6-digit code
    if (process.env.NODE_ENV === "development" && otp.length === 6) {
      // Create or find user
      // const user = await prisma.user.upsert({
      //   where: { phone },
      //   update: { lastActiveAt: new Date() },
      //   create: { phone, name: null, role: "USER" },
      // })

      const mockUser = {
        id: `user_${phone}`,
        phone,
        name: null,
        role: "USER",
        preferredLang: "ar",
      }

      // Simple token (replace with real JWT later)
      const token = Buffer.from(JSON.stringify({ userId: mockUser.id, phone, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64")

      return NextResponse.json({
        success: true,
        token,
        user: mockUser,
      })
    }

    return NextResponse.json({ error: "رمز غير صحيح أو منتهي" }, { status: 401 })
  } catch (error) {
    console.error("verify-otp error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
