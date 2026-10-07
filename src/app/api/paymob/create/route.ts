import { NextRequest, NextResponse } from "next/server"
import { createPaymobIntention } from "@/lib/paymob"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()
    const type = body.type as string
    const amount = Number(body.amount)
    const referenceId = String(body.referenceId || "")

    if (!["escrow", "commission", "legal"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    if (!process.env.PAYMOB_API_KEY || !process.env.PAYMOB_INTEGRATION_ID) {
      return NextResponse.json(
        {
          error: "Paymob غير مضبوط — أضف PAYMOB_API_KEY و PAYMOB_INTEGRATION_ID في Vercel",
          demo: true,
          iframeUrl: null,
        },
        { status: 503 }
      )
    }

    const orderId = `${type}_${referenceId || Date.now()}`
    const labels: Record<string, string> = {
      escrow: "دفع وسيط قريب",
      commission: "عمولة منصة قريب",
      legal: "أتعاب استشارة قانونية",
    }

    const intention = await createPaymobIntention({
      amount,
      orderId,
      customerName: session?.name || "عميل قريب",
      customerPhone: session?.phone || "01000000000",
      items: [
        {
          name: labels[type] || "Areep payment",
          amount,
          quantity: 1,
        },
      ],
    })

    try {
      if (type === "escrow" && referenceId) {
        await db.escrowDeal.updateMany({
          where: { id: referenceId },
          data: { status: "PENDING_PAYMENT" },
        })
      }
    } catch {}

    return NextResponse.json({ ok: true, orderId, intention })
  } catch (e: any) {
    console.error("paymob create", e)
    return NextResponse.json({ error: e?.message || "Paymob error" }, { status: 500 })
  }
}
