import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const deals = await db.escrowDeal.findMany({
      where: {
        status: { in: ["RELEASED", "COMPLETED"] },
      },
      orderBy: { releasedAt: "desc" },
      take: 100,
    })

    const sellerIds = [...new Set(deals.map((d: any) => d.sellerId))]
    const adIds = [...new Set(deals.map((d: any) => d.adId))]
    const sellers = sellerIds.length
      ? await db.user.findMany({
          where: { id: { in: sellerIds } },
          select: {
            id: true,
            name: true,
            phone: true,
            bankName: true,
            bankAccountName: true,
            bankAccountNumber: true,
            bankIban: true,
            walletType: true,
            walletNumber: true,
          },
        })
      : []
    const ads = adIds.length
      ? await db.ad.findMany({
          where: { id: { in: adIds } },
          select: { id: true, titleAr: true },
        })
      : []
    const sMap = Object.fromEntries(sellers.map((s: any) => [s.id, s]))
    const aMap = Object.fromEntries(ads.map((a: any) => [a.id, a]))

    const items = deals.map((d: any) => {
      const seller = sMap[d.sellerId] || {}
      const net = Number(d.amount) - Number(d.sellerCommission)
      const hasPayoutInfo = Boolean(
        (seller.bankAccountNumber && seller.bankAccountName) ||
          (seller.walletType && seller.walletNumber)
      )
      return {
        id: d.id,
        status: d.status,
        payoutStatus: d.payoutStatus || (d.status === "RELEASED" ? "PENDING_PAYOUT" : "NONE"),
        amount: Number(d.amount),
        sellerCommission: Number(d.sellerCommission),
        buyerCommission: Number(d.buyerCommission),
        sellerNet: net,
        platformFee: Number(d.sellerCommission) + Number(d.buyerCommission),
        releasedAt: d.releasedAt,
        payoutAt: d.payoutAt,
        payoutRef: d.payoutRef,
        payoutMethod: d.payoutMethod,
        payoutNote: d.payoutNote,
        ad: aMap[d.adId] || null,
        seller,
        hasPayoutInfo,
      }
    })

    const pending = items.filter((i: any) => i.payoutStatus !== "PAID_OUT")
    const paid = items.filter((i: any) => i.payoutStatus === "PAID_OUT")

    return NextResponse.json({
      success: true,
      pending,
      paid,
      totals: {
        pendingAmount: pending.reduce((s: number, i: any) => s + i.sellerNet, 0),
        paidAmount: paid.reduce((s: number, i: any) => s + i.sellerNet, 0),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, pending: [], paid: [] }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const id = String(body.id || "")
  const action = String(body.action || "mark_paid")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  try {
    if (action === "mark_paid") {
      await db.escrowDeal.update({
        where: { id },
        data: {
          payoutStatus: "PAID_OUT",
          payoutAt: new Date(),
          payoutRef: body.payoutRef ? String(body.payoutRef) : null,
          payoutMethod: body.payoutMethod ? String(body.payoutMethod) : null,
          payoutNote: body.payoutNote ? String(body.payoutNote) : null,
        },
      })
      return NextResponse.json({ success: true })
    }
    if (action === "mark_pending") {
      await db.escrowDeal.update({
        where: { id },
        data: { payoutStatus: "PENDING_PAYOUT", payoutAt: null },
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
