import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { setSessionCookie } from "@/lib/session"
import { isAdminPhone, normalizePhone } from "@/lib/admin"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const { phone: raw, otp } = await req.json()
    const phone = normalizePhone(String(raw || ""))
    const code = String(otp || "").trim()

    if (!phone || !code) {
      return NextResponse.json({ error: "Missing phone or otp" }, { status: 400 })
    }

    // Try exact + normalized lookup for OTP
    const record = await db.otpCode.findFirst({
      where: {
        OR: [{ phone }, { phone: raw }],
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
    const role = admin ? "ADMIN" : "USER"

    // Upsert by normalized phone; also try find existing with variants
    let user = await db.user.findFirst({
      where: {
        OR: [
          { phone },
          { phone: String(raw || "").replace(/\s/g, "") },
        ],
      },
    })

    if (user) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          phone, // normalize stored phone
          lastActiveAt: new Date(),
          role: admin ? "ADMIN" : user.role === "ADMIN" && !admin ? "USER" : user.role,
          ...(admin ? { role: "ADMIN" } : {}),
        },
      })
    } else {
      user = await db.user.create({
        data: {
          phone,
          name: null,
          role,
        },
      })
    }

    // Final force admin
    if (admin && user.role !== "ADMIN") {
      user = await db.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      })
    }

    await setSessionCookie({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      debug: {
        isAdminPhone: admin,
        // does not leak full ADMIN_PHONES list
        adminPhonesConfigured: Boolean(process.env.ADMIN_PHONES?.trim()),
      },
    })
  } catch (error: any) {
    console.error("verify-otp error:", error)
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
