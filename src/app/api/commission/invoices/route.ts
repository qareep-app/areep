import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import {
  createCommissionInvoice,
  getPendingCommissionTotal,
} from "@/lib/commission-invoice"
import { createPaymobIntention } from "@/lib/paymob"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ items: [] })
  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const items = await db.commissionInvoice.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    const totals = await getPendingCommissionTotal(userId)
    const now = new Date()
    return NextResponse.json({
      success: true,
      totals,
      items: items.map((i: any) => ({
        ...i,
        dealAmount: Number(i.dealAmount),
        feeAmount: Number(i.feeAmount),
        feePercent: Number(i.feePercent),
        isOverdue: i.status === "PENDING" && i.dueAt && new Date(i.dueAt) < now,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message })
  }
}

/** إنشاء فاتورة بعد تأكيد بيع عادي / عند الاستلام */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
  }
  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const body = await req.json().catch(() => ({}))
    const adId = body.adId ? String(body.adId) : null
    let dealAmount = Number(body.dealAmount || body.amount || 0)
    let categorySlug: string | undefined

    if (adId) {
      const ad = await db.ad.findUnique({
        where: { id: adId },
        include: { category: true },
      })
      if (!ad || ad.userId !== userId) {
        return NextResponse.json({ error: "الإعلان غير موجود أو ليس لك" }, { status: 404 })
      }
      if (!dealAmount) dealAmount = Number(ad.price)
      categorySlug = ad.category?.slug
    }

    if (!dealAmount || dealAmount < 1) {
      return NextResponse.json({ error: "قيمة البيعة مطلوبة" }, { status: 400 })
    }

    const inv = await createCommissionInvoice({
      sellerId: userId,
      adId,
      dealAmount,
      categorySlug,
      source: body.source || "COD",
      note: body.note,
    })

    return NextResponse.json({
      success: true,
      invoice: {
        ...inv,
        dealAmount: Number(inv.dealAmount),
        feeAmount: Number(inv.feeAmount),
        feePercent: Number(inv.feePercent),
      },
    })
  } catch (e: any) {
    console.error("create commission invoice", e)
    return NextResponse.json(
      {
        error:
          e?.message?.includes("commissionInvoice") || e?.message?.includes("does not exist")
            ? "شغّل npx prisma db push لإضافة جدول الفواتير"
            : e?.message,
      },
      { status: 500 }
    )
  }
}

/** بدء دفع فاتورة عبر Paymob */
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "login" }, { status: 401 })
  }
  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const body = await req.json().catch(() => ({}))
    const id = String(body.id || body.invoiceId || "")
    const action = String(body.action || "pay")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const inv = await db.commissionInvoice.findUnique({ where: { id } })
    if (!inv || inv.sellerId !== userId) {
      return NextResponse.json({ error: "غير موجودة" }, { status: 404 })
    }
    if (inv.status !== "PENDING") {
      return NextResponse.json({ error: "الفاتورة ليست معلقة" }, { status: 400 })
    }

    if (action === "cancel") {
      await db.commissionInvoice.update({
        where: { id },
        data: { status: "CANCELLED" },
      })
      return NextResponse.json({ success: true })
    }

    const amount = Number(inv.feeAmount)
    const paymobReady = Boolean(
      process.env.PAYMOB_API_KEY?.trim() && process.env.PAYMOB_INTEGRATION_ID
    )

    if (!paymobReady) {
      // تجريبي: اعتبارها مدفوعة
      await db.commissionInvoice.update({
        where: { id },
        data: { status: "PAID", paidAt: new Date(), paymobOrderId: `demo_${id}` },
      })
      return NextResponse.json({
        success: true,
        demo: true,
        message: "تم السداد (وضع تجريبي بدون Paymob)",
      })
    }

    const orderId = `commission_${id}_${Date.now()}`
    const result = await createPaymobIntention({
      amount,
      orderId,
      customerName: session.name || "بائع قريب",
      customerPhone: session.phone || "01000000000",
      items: [{ name: `عمولة قريب ${amount} ج`, amount, quantity: 1 }],
    })

    await db.commissionInvoice.update({
      where: { id },
      data: { paymobOrderId: orderId },
    })

    const iframeUrl =
      (result as any).iframeUrl || (result as any).iframe_url || null

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      iframeUrl,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
