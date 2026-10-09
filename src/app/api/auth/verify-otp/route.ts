import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { attachSessionCookies } from "@/lib/session"
import { isAdminPhone, normalizePhone } from "@/lib/admin"
import { akedlyVerifyOtp } from "@/lib/akedly"
import crypto from "crypto"

const db = prisma as any
const SECRET = process.env.SESSION_SECRET || "areep-demo-secret-change-me"

function parseOtpCookie(raw: string | undefined) {
  if (!raw) return null
  try {
    const data = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"))
    const payload = `${data.phone}.${data.code}.${data.exp}.${data.extra || ""}`
    const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex")
    if (sig !== data.sig) return null
    if (Date.now() > Number(data.exp)) return null
    return data as {
      phone: string
      code: string
      exp: number
      extra?: string
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawPhone = String(body.phone || "")
    const phone = normalizePhone(rawPhone)
    const code = String(body.otp || "").trim()

    if (!phone || !code) {
      return NextResponse.json({ error: "Missing phone or otp" }, { status: 400 })
    }

    const cookieData = parseOtpCookie(req.cookies.get("areep_otp")?.value)
    let valid = false

    if (cookieData && cookieData.phone === phone) {
      if (cookieData.code === "AKEDLY" && cookieData.extra) {
        const [transactionID, transactionReqID] = String(cookieData.extra).split("|")
        const v = await akedlyVerifyOtp({
          transactionID,
          otp: code,
          transactionReqID: transactionReqID || undefined,
        })
        valid = v.ok
        if (!v.ok) {
          return NextResponse.json(
            { error: v.error || "رمز غير صحيح" },
            { status: 401 }
          )
        }
      } else if (cookieData.code === code) {
        valid = true
      }
    }

    // DB fallback for local OTP
    if (!valid) {
      try {
        const record = await db.otpCode.findFirst({
          where: {
            OR: [{ phone }, { phone: rawPhone.replace(/\s/g, "") }],
            code,
            used: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        })
        if (record) {
          valid = true
          await db.otpCode.update({
            where: { id: record.id },
            data: { used: true },
          })
        }
      } catch {}
    }

    if (!valid) {
      return NextResponse.json(
        { error: "رمز غير صحيح أو منتهي الصلاحية" },
        { status: 401 }
      )
    }

    const admin = isAdminPhone(phone)
    let user: any = null
    try {
      user = await db.user.findFirst({
        where: { OR: [{ phone }, { phone: rawPhone.replace(/\s/g, "") }] },
      })
      if (user) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            phone,
            lastActiveAt: new Date(),
            ...(admin ? { role: "ADMIN" } : {}),
          },
        })
      } else {
        user = await db.user.create({
          data: {
            phone,
            name: null,
            role: admin ? "ADMIN" : "USER",
          },
        })
      }
    } catch {
      user = {
        id: `tmp_${phone}`,
        phone,
        name: null,
        role: admin ? "ADMIN" : "USER",
      }
    }
    if (admin) user.role = "ADMIN"

    const sessionUser = {
      id: String(user.id),
      phone: String(user.phone),
      name: user.name ?? null,
      role: String(user.role),
    }

    const res = NextResponse.json({
      success: true,
      user: sessionUser,
      debug: { isAdminPhone: admin },
    })
    res.cookies.set("areep_otp", "", { path: "/", maxAge: 0 })
    return attachSessionCookies(res, sessionUser)
  } catch (error: any) {
    console.error("verify-otp error:", error)
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
