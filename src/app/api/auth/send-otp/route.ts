import { NextRequest, NextResponse } from "next/server"
import { sendSms } from "@/lib/sms"
import { normalizePhone } from "@/lib/admin"
import { akedlySendOtp, isAkedlyConfigured } from "@/lib/akedly"
import crypto from "crypto"

const SECRET = process.env.SESSION_SECRET || "areep-demo-secret-change-me"

function signOtp(phone: string, code: string, exp: number, extra?: string) {
  const payload = `${phone}.${code}.${exp}.${extra || ""}`
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex")
  return Buffer.from(JSON.stringify({ phone, code, exp, extra, sig })).toString(
    "base64url"
  )
}

export async function POST(req: NextRequest) {
  try {
    const { phone: raw } = await req.json()
    const phone = normalizePhone(String(raw || ""))

    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "رقم موبايل مصري غير صحيح (مثال: 01012345678)" },
        { status: 400 }
      )
    }

    // Prefer Akedly
    if (isAkedlyConfigured()) {
      const sent = await akedlySendOtp(phone)
      if (!sent.ok) {
        return NextResponse.json(
          { error: "تعذر إرسال الرمز عبر Akedly", detail: sent.error },
          { status: 502 }
        )
      }
      const res = NextResponse.json({
        success: true,
        mode: "akedly",
        message: "تم إرسال رمز التحقق (واتساب / SMS)",
        channels: sent.channels,
      })
      // Store Akedly transaction refs in cookie (no local OTP code)
      const exp = Date.now() + 10 * 60 * 1000
      const token = signOtp(
        phone,
        "AKEDLY",
        exp,
        `${sent.transactionID}|${sent.transactionReqID || ""}`
      )
      res.cookies.set("areep_otp", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 60,
      })
      return res
    }

    // Fallback: local OTP + Twilio/SMS or dev display
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const exp = Date.now() + 5 * 60 * 1000
    const msg = `رمز التحقق في قريب: ${otp}\nصالح لمدة 5 دقائق.`
    const sms = await sendSms(phone, msg)

    if (!sms.ok && sms.mode !== "dev") {
      return NextResponse.json(
        { error: "تعذر إرسال الرسالة", detail: sms.error },
        { status: 502 }
      )
    }

    const res = NextResponse.json({
      success: true,
      message:
        sms.mode === "dev"
          ? "وضع تجريبي: الرمز ظاهر هنا (لم يُضبط Akedly/Twilio)"
          : "تم إرسال رمز التحقق",
      mode: sms.mode,
      ...(sms.mode === "dev" ? { devOtp: otp } : {}),
    })
    res.cookies.set("areep_otp", signOtp(phone, otp, exp), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
      sameSite: "lax",
      path: "/",
      maxAge: 5 * 60,
    })
    return res
  } catch (error: any) {
    console.error("send-otp error:", error)
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 })
  }
}
