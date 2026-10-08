import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !String(email).includes("@")) {
      return NextResponse.json({ error: "بريد غير صحيح" }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const key = `email:${String(email).toLowerCase().trim()}`

    // Save OTP (ignore DB errors so email can still send)
    try {
      await db.otpCode.updateMany({
        where: { phone: key, used: false },
        data: { used: true },
      })
      await db.otpCode.create({
        data: { phone: key, code: otp, expiresAt },
      })
    } catch (dbErr: any) {
      console.error("otp save error", dbErr?.message)
    }

    if (!process.env.RESEND_API_KEY?.trim() && !process.env.BREVO_API_KEY?.trim()) {
      return NextResponse.json({
        success: true,
        mode: "dev",
        message: "البريد غير مضبوط على السيرفر — الرمز للتجربة:",
        devOtp: otp,
      })
    }

    const result = await sendEmail({
      to: String(email).trim(),
      subject: "رمز التحقق — قريب",
      html: `<div dir="rtl" style="font-family:sans-serif"><p>رمز التحقق في <strong>قريب</strong>:</p><p style="font-size:28px;letter-spacing:4px;font-weight:bold">${otp}</p><p>صالح لمدة 10 دقائق.</p></div>`,
      text: `رمز التحقق في قريب: ${otp}`,
    })

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error || "تعذر إرسال البريد",
          detail: result.error,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      mode: result.mode,
      message: "تم إرسال الرمز إلى بريدك — راجع الوارد والـ Spam",
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
