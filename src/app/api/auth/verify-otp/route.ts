import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { attachSessionCookies } from "@/lib/session"
import { isAdminPhone, normalizePhone } from "@/lib/admin"
import crypto from "crypto"

const db = prisma as any
const SECRET = process.env.SESSION_SECRET || "areep-demo-secret-change-me"

function readOtpCookie(raw: string | undefined, phone: string, code: string): boolean {
  if (!raw) return false
  try {
    const data = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"))
    if (data.phone !== phone || data.code !== code) return false
    if (Date.now() > Number(data.exp)) return false
    const payload = `${data.phone}.${data.code}.${data.exp}`
    const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex")
    return sig === data.sig
  } catch {
    return false
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

    const otpCookie = req.cookies.get("areep_otp")?.value
    let valid = readOtpCookie(otpCookie, phone, code)

    // Fallback: DB OTP if cookie missing
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
      } catch (e) {
        console.error("otp db fallback", e)
      }
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
    } catch (dbErr: any) {
      // DB down — still allow session for admin testing
      console.error("user db error", dbErr?.message)
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
      debug: {
        isAdminPhone: admin,
        adminPhonesConfigured: Boolean(process.env.ADMIN_PHONES?.trim()),
        authVia: otpCookie ? "cookie" : "db",
      },
    })

    // clear otp cookie
    res.cookies.set("areep_otp", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    })

    return attachSessionCookies(res, sessionUser)
  } catch (error: any) {
    console.error("verify-otp error:", error)
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
