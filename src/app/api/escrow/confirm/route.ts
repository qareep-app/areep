import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { prisma } from "@/lib/prisma"

const db = prisma as any

/**
 * POST /api/escrow/confirm
 * actions:
 *  - mark_paid (buyer or admin — للاختبار بدون webhook)
 *  - confirm_delivery (seller)
 *  - confirm_receipt (buyer) → RELEASED
 *  - cancel (buyer/seller if PENDING_PAYMENT)
 *  - dispute
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const dealId = String(body.dealId || body.transactionId || "")
    const action = String(body.action || "")
    if (!dealId || !action) {
      return NextResponse.json({ error: "dealId و action مطلوبان" }, { status: 400 })
    }

    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const deal = await db.escrowDeal.findUnique({ where: { id: dealId } })
    if (!deal) {
      return NextResponse.json({ error: "الصفقة غير موجودة" }, { status: 404 })
    }

    const isBuyer = deal.buyerId === userId
    const isSeller = deal.sellerId === userId
    const isAdmin = session.role === "ADMIN"

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    let newStatus = deal.status
    let message = ""

    if (action === "mark_paid") {
      if (!isBuyer && !isAdmin) {
        return NextResponse.json({ error: "المشتري فقط" }, { status: 403 })
      }
      if (deal.status !== "PENDING_PAYMENT") {
        return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 })
      }
      newStatus = "HELD"
      message = "تم تأكيد الدفع — المبلغ محجوز لدى قريب"
    } else if (action === "confirm_delivery") {
      if (!isSeller && !isAdmin) {
        return NextResponse.json({ error: "البائع فقط يؤكد التسليم" }, { status: 403 })
      }
      if (deal.status !== "HELD") {
        return NextResponse.json({ error: "يجب أن تكون الصفقة مدفوعة أولاً" }, { status: 400 })
      }
      newStatus = "DELIVERED"
      message = "تم تأكيد التسليم — بانتظار تأكيد المشتري"
    } else if (action === "confirm_receipt") {
      if (!isBuyer && !isAdmin) {
        return NextResponse.json({ error: "المشتري فقط يؤكد الاستلام" }, { status: 403 })
      }
      if (!["HELD", "DELIVERED"].includes(deal.status)) {
        return NextResponse.json({ error: "حالة غير صالحة لتأكيد الاستلام" }, { status: 400 })
      }
      newStatus = "RELEASED"
      message = `تم تحرير المبلغ للبائع (${Number(deal.amount) - Number(deal.sellerCommission)} ج.م بعد خصم العمولة)`
      await db.escrowDeal.update({
        where: { id: dealId },
        data: { status: newStatus, releasedAt: new Date() },
      })
      return NextResponse.json({
        success: true,
        dealId,
        newStatus,
        message,
        sellerReceives: Number(deal.amount) - Number(deal.sellerCommission),
        platformFee: Number(deal.sellerCommission) + Number(deal.buyerCommission),
      })
    } else if (action === "cancel") {
      if (deal.status !== "PENDING_PAYMENT") {
        return NextResponse.json({ error: "يمكن الإلغاء فقط قبل الدفع" }, { status: 400 })
      }
      newStatus = "CANCELLED"
      message = "تم إلغاء الصفقة"
    } else if (action === "dispute") {
      if (!["HELD", "DELIVERED"].includes(deal.status)) {
        return NextResponse.json({ error: "لا يمكن فتح نزاع في هذه الحالة" }, { status: 400 })
      }
      newStatus = "DISPUTED"
      message = "تم فتح نزاع — الأدمن سيراجع"
    } else {
      return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 })
    }

    await db.escrowDeal.update({
      where: { id: dealId },
      data: { status: newStatus },
    })

    return NextResponse.json({ success: true, dealId, newStatus, message })
  } catch (e: any) {
    console.error("escrow confirm", e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
