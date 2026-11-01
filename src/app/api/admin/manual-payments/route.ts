import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { activateUserPackage } from "@/lib/packages"

const db = prisma as any

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized", requests: [] }, { status: 401 })
  }
  try {
    const requests = await db.manualPaymentRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    // enrich with user phone/name
    const userIds = [...new Set(requests.map((r: any) => r.userId))]
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, phone: true },
    }).catch(() => [])
    const map = Object.fromEntries((users || []).map((u: any) => [u.id, u]))
    return NextResponse.json({
      success: true,
      requests: requests.map((r: any) => ({
        ...r,
        user: map[r.userId] || null,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      requests: [],
      error: e?.message || "جدول ManualPaymentRequest غير موجود — نفّذ prisma db push",
    })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const id = String(body.id || "")
    const action = String(body.action || "") // approve | reject
    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "معاملات ناقصة" }, { status: 400 })
    }

    const row = await db.manualPaymentRequest.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    if (row.status !== "PENDING") {
      return NextResponse.json({ error: "الطلب تمت مراجعته من قبل" }, { status: 400 })
    }

    if (action === "reject") {
      await db.manualPaymentRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: String((admin as any)?.phone || (admin as any)?.id || "admin"),
        },
      })
      return NextResponse.json({ ok: true, status: "REJECTED" })
    }

    // approve → activate package
    await activateUserPackage(row.userId, row.packageSlug)
    await db.manualPaymentRequest.update({
      where: { id },
      data: {
        status: "PAID",
        reviewedAt: new Date(),
        reviewedBy: String((admin as any)?.phone || (admin as any)?.id || "admin"),
      },
    })

    return NextResponse.json({ ok: true, status: "PAID", activated: row.packageSlug })
  } catch (e: any) {
    console.error("admin manual-payments", e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
