import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const items = await db.commissionInvoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    const sellerIds = [...new Set(items.map((i: any) => i.sellerId))]
    const sellers = sellerIds.length
      ? await db.user.findMany({
          where: { id: { in: sellerIds } },
          select: { id: true, name: true, phone: true },
        })
      : []
    const map = Object.fromEntries(sellers.map((s: any) => [s.id, s]))
    const now = new Date()
    return NextResponse.json({
      success: true,
      items: items.map((i: any) => ({
        ...i,
        dealAmount: Number(i.dealAmount),
        feeAmount: Number(i.feeAmount),
        isOverdue: i.status === "PENDING" && i.dueAt && new Date(i.dueAt) < now,
        seller: map[i.sellerId] || null,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, items: [] }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const id = String(body.id || "")
  const action = String(body.action || "")
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 })
  try {
    if (action === "waive") {
      await db.commissionInvoice.update({
        where: { id },
        data: { status: "WAIVED" },
      })
    } else if (action === "mark_paid") {
      await db.commissionInvoice.update({
        where: { id },
        data: { status: "PAID", paidAt: new Date() },
      })
    } else if (action === "cancel") {
      await db.commissionInvoice.update({
        where: { id },
        data: { status: "CANCELLED" },
      })
    } else {
      return NextResponse.json({ error: "unknown" }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
