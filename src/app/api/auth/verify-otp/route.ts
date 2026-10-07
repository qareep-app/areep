import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { setSessionCookie } from "@/lib/session"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const { phone: raw, otp } = await req.json()
    const phone = String(raw || "").replace(/\s+/g, "")
    const code = String(otp || "").trim()

    if (!phone || !code) {
      return NextResponse.json({ error: "Missing phone or otp" }, { status: 400 })
    }

    const record = await db.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    // Demo fallback: accept 000000 only if no provider and no record (optional)
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

    const adminPhones = (process.env.ADMIN_PHONES || "01000000001")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const role = adminPhones.includes(phone) ? "ADMIN" : "USER"

    const user = await db.user.upsert({
      where: { phone },
      update: { lastActiveAt: new Date(), ...(role === "ADMIN" ? { role: "ADMIN" } : {}) },
      create: {
        phone,
        name: null,
        role,
      },
    })

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
    })
  } catch (error: any) {
    console.error("verify-otp error:", error)
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
