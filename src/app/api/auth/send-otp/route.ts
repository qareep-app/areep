import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSms } from "@/lib/sms"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const { phone: raw } = await req.json()
    const phone = String(raw || "").replace(/\s+/g, "")

    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "رقم موبايل مصري غير صحيح (مثال: 01012345678)" },
        { status: 400 }
      )
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Invalidate old codes
    await db.otpCode.updateMany({
      where: { phone, used: false },
      data: { used: true },
    }).catch(() => {})

    await db.otpCode.create({
      data: { phone, code: otp, expiresAt },
    })

    const msg = `رمز التحقق في قريب: ${otp}\nصالح لمدة 5 دقائق.`
    const sms = await sendSms(phone, msg)

    if (!sms.ok) {
      return NextResponse.json(
        { error: "تعذر إرسال الرسالة. حاول لاحقاً.", detail: sms.error },
        { status: 502 }
      )
    }

    const resBody: any = {
      success: true,
      message: sms.mode === "dev"
        ? "وضع تجريبي: لم يُضبط مزود SMS — الرمز ظاهر هنا للعرض"
        : "تم إرسال رمز التحقق إلى موبايلك",
      mode: sms.mode,
    }

    // Only expose OTP when no real SMS provider (demo safety)
    if (sms.mode === "dev") {
      resBody.devOtp = otp
    }

    return NextResponse.json(resBody)
  } catch (error: any) {
    console.error("send-otp error:", error)
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
