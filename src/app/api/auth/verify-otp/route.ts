import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { attachSessionCookies } from "@/lib/session"
import { isAdminPhone, normalizePhone } from "@/lib/admin"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const raw = String(body.phone || "")
    const phone = normalizePhone(raw)
    const code = String(body.otp || "").trim()

    if (!phone || !code) {
      return NextResponse.json({ error: "Missing phone or otp" }, { status: 400 })
    }

    const record = await db.otpCode.findFirst({
      where: {
        OR: [{ phone }, { phone: raw.replace(/\s/g, "") }],
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!record) {
      return NextResponse.json(
        { error: "رمز غير صحيح أو منتهي الصلاحية" },
        { status: 401 }
      )
    }

    await db.otpCode.update({
      where: { id: record.id },
      data: { used: true },
    })

    const admin = isAdminPhone(phone)

    let user = await db.user.findFirst({
      where: {
        OR: [{ phone }, { phone: raw.replace(/\s/g, "") }],
      },
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

    if (admin && user.role !== "ADMIN") {
      user = await db.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      })
    }

    const sessionUser = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as string,
    }

    const res = NextResponse.json({
      success: true,
      user: sessionUser,
      debug: {
        isAdminPhone: admin,
        adminPhonesConfigured: Boolean(process.env.ADMIN_PHONES?.trim()),
      },
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
