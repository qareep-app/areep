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
    const key = `email:${String(email).toLowerCase()}`

    await db.otpCode.updateMany({
      where: { phone: key, used: false },
      data: { used: true },
    }).catch(() => {})

    await db.otpCode.create({
      data: { phone: key, code: otp, expiresAt },
    })

    const result = await sendEmail({
      to: String(email),
      subject: "رمز التحقق — قريب",
      html: `<p>رمز التحقق في قريب: <strong style="font-size:20px">${otp}</strong></p><p>صالح 10 دقائق.</p>`,
      text: `رمز التحقق في قريب: ${otp}`,
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: "تعذر إرسال البريد", detail: result.error },
        { status: 502 }
      )
    }

    const body: any = {
      success: true,
      mode: result.mode,
      message:
        result.mode === "dev"
          ? "وضع تجريبي: البريد غير مضبوط — الرمز ظاهر هنا"
          : "تم إرسال الرمز إلى بريدك",
    }
    if (result.mode === "dev") body.devOtp = otp
    return NextResponse.json(body)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
