import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import {
  getPackageMeta,
  resolveDbUserId,
} from "@/lib/packages"

const db = prisma as any

/** POST: طلب دفع يدوي لباقة */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }
    const body = await req.json().catch(() => ({}))
    const packageSlug = String(body.packageSlug || body.packageId || "").trim()
    const method = String(body.method || "instapay").toLowerCase()
    const reference = body.reference ? String(body.reference).slice(0, 120) : null
    const note = body.note ? String(body.note).slice(0, 500) : null

    if (!getPackageMeta(packageSlug) || packageSlug === "free") {
      return NextResponse.json({ error: "باقة غير صالحة" }, { status: 400 })
    }
    if (!["instapay", "vodafone"].includes(method)) {
      return NextResponse.json({ error: "طريقة دفع غير معروفة" }, { status: 400 })
    }

    const meta = getPackageMeta(packageSlug)
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })

    // منع تكرار طلب معلّق لنفس الباقة
    const existing = await db.manualPaymentRequest
      .findFirst({
        where: { userId, packageSlug, status: "PENDING" },
      })
      .catch(() => null)
    if (existing) {
      return NextResponse.json({
        ok: true,
        request: existing,
        message: "لديك طلب معلّق بالفعل — انتظر مراجعة الأدمن",
      })
    }

    const row = await db.manualPaymentRequest.create({
      data: {
        userId,
        packageSlug,
        amount: meta.price,
        method,
        reference,
        note,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      ok: true,
      request: row,
      message: "تم إرسال الطلب — سيتم التفعيل بعد مراجعة التحويل",
    })
  } catch (e: any) {
    console.error("manual-request", e)
    return NextResponse.json(
      { error: e?.message || "فشل إنشاء الطلب — تأكد من prisma db push" },
      { status: 500 }
    )
  }
}

/** GET: طلبات المستخدم */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ ok: true, requests: [] })
    }
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const requests = await db.manualPaymentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return NextResponse.json({ ok: true, requests })
  } catch (e: any) {
    return NextResponse.json({ ok: false, requests: [], error: e?.message })
  }
}
