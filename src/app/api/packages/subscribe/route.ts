import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createPaymobIntention } from "@/lib/paymob"
import {
  activateUserPackage,
  getPackageMeta,
  resolveDbUserId,
  getQuotaSnapshot,
} from "@/lib/packages"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const packageId = (body.packageId || body.packageSlug) as string
    if (!packageId || !getPackageMeta(packageId)) {
      return NextResponse.json({ error: "باقة غير معروفة" }, { status: 400 })
    }

    const meta = getPackageMeta(packageId)
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })

    if (meta.price === 0) {
      const up = await activateUserPackage(userId, packageId)
      const quota = await getQuotaSnapshot(userId)
      return NextResponse.json({ ok: true, free: true, userPackage: up, quota })
    }

    if (!process.env.PAYMOB_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "Paymob غير مضبوط — أضف المفاتيح على Vercel" },
        { status: 503 }
      )
    }

    const result = await createPaymobIntention({
      amount: meta.price,
      orderId: `package_${packageId}_${userId}_${Date.now()}`,
      customerName: session.name || "عميل قريب",
      customerPhone: session.phone,
      items: [{ name: `باقة ${meta.nameAr}`, amount: meta.price, quantity: 1 }],
    })

    const iframeUrl = (result as any).iframeUrl || null
    const res = NextResponse.json({ ok: true, iframeUrl, intention: result })
    res.cookies.set("areep_pending_pkg", `${packageId}|${userId}`, {
      path: "/",
      maxAge: 60 * 60,
      sameSite: "lax",
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
