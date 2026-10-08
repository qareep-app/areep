import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createPaymobIntention } from "@/lib/paymob"
import { prisma } from "@/lib/prisma"

const db = prisma as any

const PRICES: Record<string, number> = {
  free: 0,
  basic: 149,
  pro: 349,
  cars: 799,
  realestate: 599,
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }

    const { packageId } = await req.json()
    if (!packageId || !(packageId in PRICES)) {
      return NextResponse.json({ error: "باقة غير معروفة" }, { status: 400 })
    }

    const amount = PRICES[packageId]

    if (amount === 0) {
      // Activate free package in DB if model exists
      try {
        const pkg = await db.package.findFirst({ where: { slug: "free" } }).catch(() => null)
        if (pkg) {
          await db.userPackage.create({
            data: {
              userId: session.id,
              packageId: pkg.id,
              startAt: new Date(),
              endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: "ACTIVE",
            },
          })
        }
      } catch {}
      return NextResponse.json({ ok: true, free: true, message: "الباقة المجانية مفعّلة" })
    }

    if (!process.env.PAYMOB_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "Paymob غير مضبوط — أضف المفاتيح على Vercel" },
        { status: 503 }
      )
    }

    const result = await createPaymobIntention({
      amount,
      orderId: `pkg_${packageId}_${session.id.slice(-6)}_${Date.now()}`,
      customerName: session.name || "عميل قريب",
      customerPhone: session.phone,
      items: [{ name: `باقة ${packageId}`, amount, quantity: 1 }],
    })

    const iframeUrl = (result as any).iframeUrl || null
    return NextResponse.json({ ok: true, iframeUrl, intention: result })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
