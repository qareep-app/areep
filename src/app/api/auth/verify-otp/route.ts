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

    const adminPhones = (process.env.ADMIN_PHONES || "")
      .split(/[,;\s]+/)
      .map((s: string) => s.trim())
      .filter(Boolean)

    const isAdmin = adminPhones.includes(phone)
    const role = isAdmin ? "ADMIN" : undefined

    const user = await db.user.upsert({
      where: { phone },
      update: {
        lastActiveAt: new Date(),
        ...(isAdmin ? { role: "ADMIN" } : {}),
      },
      create: {
        phone,
        name: null,
        role: isAdmin ? "ADMIN" : "USER",
      },
    })

    // Ensure role field is ADMIN if list matches (even if upsert missed)
    let finalRole = user.role
    if (isAdmin && user.role !== "ADMIN") {
      const updated = await db.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      })
      finalRole = updated.role
    }

    await setSessionCookie({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: finalRole,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: finalRole,
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
