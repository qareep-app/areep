import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { requireAdminSession } from "@/lib/admin"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()

    const phone = String(body.phone || session?.phone || "").replace(/\s/g, "")
    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      return NextResponse.json({ error: "رقم موبايل غير صحيح" }, { status: 400 })
    }
    if (!body.fullName || !body.shopName || !body.businessType || !body.verifyLevel) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 })
    }

    const userId = session
      ? await resolveDbUserId({ id: session.id, phone: session.phone || phone })
      : (
          await db.user.upsert({
            where: { phone },
            update: {},
            create: { phone, name: body.fullName, role: "USER" },
          })
        ).id

    await db.user.update({
      where: { id: userId },
      data: {
        name: body.fullName,
        email: body.email || undefined,
        role: "SELLER_PENDING",
        sellerStatus: "PENDING",
        bankName: body.bankName || undefined,
        bankAccountName: body.bankAccountName || undefined,
        bankAccountNumber: body.bankAccountNumber || undefined,
        bankIban: body.bankIban || undefined,
        walletType: body.walletType || undefined,
        walletNumber: body.walletNumber || undefined,
      },
    })

    const app = await db.sellerApplication.create({
      data: {
        userId,
        email: body.email || null,
        phone,
        fullName: body.fullName,
        shopName: body.shopName,
        shopBio: body.shopBio || null,
        businessType: body.businessType,
        verifyLevel: body.verifyLevel,
        nationalId: body.nationalId || null,
        commercialReg: body.commercialReg || null,
        idFrontUrl: body.idFrontUrl || null,
        idBackUrl: body.idBackUrl || null,
        commercialDocUrl: body.commercialDocUrl || null,
        isVatRegistered: Boolean(body.isVatRegistered),
        addressDetail: body.addressDetail || null,
        addressExtra: body.addressExtra || null,
        addressCity: body.addressCity || null,
        bankName: body.bankName || null,
        bankAccountName: body.bankAccountName || null,
        bankAccountNumber: body.bankAccountNumber || null,
        bankIban: body.bankIban || null,
        walletType: body.walletType || null,
        walletNumber: body.walletNumber || null,
        status: "PENDING",
      },
    })

    return NextResponse.json({ ok: true, application: app })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const status = new URL(req.url).searchParams.get("status") || "PENDING"
  const list = await db.sellerApplication.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json({ ok: true, applications: list })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json()
  const { id, action, adminNote } = body
  if (!id || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  const app = await db.sellerApplication.findUnique({ where: { id } })
  if (!app) return NextResponse.json({ error: "not found" }, { status: 404 })

  const status = action === "APPROVE" ? "APPROVED" : "REJECTED"
  await db.sellerApplication.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  })

  if (action === "APPROVE") {
    const badge = app.verifyLevel === "VERIFIED" ? "VERIFIED" : "BASIC"
    const maxOrder = badge === "BASIC" ? 25000 : null
    await db.user.update({
      where: { id: app.userId },
      data: {
        role: "SELLER",
        sellerStatus: "APPROVED",
        trustBadge: badge,
        shopName: app.shopName,
        shopBio: app.shopBio,
        businessType: app.businessType,
        nationalId: app.nationalId,
        commercialReg: app.commercialReg,
        addressDetail: app.addressDetail,
        addressCity: app.addressCity,
        maxOrderValue: maxOrder,
        isVerified: true,
        bankName: app.bankName || undefined,
        bankAccountName: app.bankAccountName || undefined,
        bankAccountNumber: app.bankAccountNumber || undefined,
        bankIban: app.bankIban || undefined,
        walletType: app.walletType || undefined,
        walletNumber: app.walletNumber || undefined,
      },
    })
  } else {
    await db.user.update({
      where: { id: app.userId },
      data: { role: "USER", sellerStatus: "REJECTED" },
    })
  }

  return NextResponse.json({ ok: true })
}
