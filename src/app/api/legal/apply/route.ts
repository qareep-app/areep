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
    if (!body.fullName) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 })
    }
    if (!body.certificateUrl && !body.syndicateCardUrl) {
      return NextResponse.json(
        { error: "ارفع شهادة أو كارنيه النقابة على الأقل" },
        { status: 400 }
      )
    }

    let userId = session?.id
    if (!userId) {
      const u = await db.user.upsert({
        where: { phone },
        update: { name: body.fullName, email: body.email || undefined },
        create: {
          phone,
          name: body.fullName,
          email: body.email || null,
          role: "USER",
        },
      })
      userId = u.id
    }

    const app = await db.legalAdvisorApplication.create({
      data: {
        userId,
        phone,
        email: body.email || null,
        fullName: body.fullName,
        syndicateNo: body.syndicateNo || null,
        certificateUrl: body.certificateUrl || null,
        syndicateCardUrl: body.syndicateCardUrl || null,
        nationalId: body.nationalId || null,
        bio: body.bio || null,
        status: "PENDING",
      },
    })

    return NextResponse.json({ ok: true, application: app })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const status = new URL(req.url).searchParams.get("status") || "PENDING"
  const list = await db.legalAdvisorApplication.findMany({
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
  const { id, action, adminNote } = await req.json()
  const app = await db.legalAdvisorApplication.findUnique({ where: { id } })
  if (!app) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (action === "APPROVE") {
    await db.legalAdvisorApplication.update({
      where: { id },
      data: { status: "APPROVED", adminNote: adminNote || null },
    })
    if (app.userId) {
      await db.user.update({
        where: { id: app.userId },
        data: {
          role: "LEGAL_CONSULTANT",
          trustBadge: "VERIFIED_LEGAL",
          isVerified: true,
          name: app.fullName,
        },
      })
    }
  } else if (action === "REJECT") {
    await db.legalAdvisorApplication.update({
      where: { id },
      data: { status: "REJECTED", adminNote: adminNote || null },
    })
  }
  return NextResponse.json({ ok: true })
}
