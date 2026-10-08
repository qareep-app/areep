import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

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

    let user = session?.id
      ? await db.user.findUnique({ where: { id: session.id } })
      : await db.user.findUnique({ where: { phone } })

    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          email: body.email || null,
          name: body.fullName,
          role: "SELLER_PENDING",
          sellerStatus: "PENDING",
        },
      })
    } else {
      await db.user.update({
        where: { id: user.id },
        data: {
          name: body.fullName,
          email: body.email || user.email,
          role: "SELLER_PENDING",
          sellerStatus: "PENDING",
        },
      })
    }

    const app = await db.sellerApplication.create({
      data: {
        userId: user.id,
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
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
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
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
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
