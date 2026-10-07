import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const success =
      body?.success === true ||
      body?.success === "true" ||
      body?.obj?.success === true
    const specialRef =
      body?.special_reference ||
      body?.obj?.order?.merchant_order_id ||
      body?.merchant_order_id ||
      ""

    if (success && typeof specialRef === "string") {
      if (specialRef.startsWith("escrow_")) {
        const id = specialRef.replace("escrow_", "")
        await db.escrowDeal.update({ where: { id }, data: { status: "HELD" } }).catch(() => {})
      }
      if (specialRef.startsWith("legal_")) {
        const id = specialRef.replace("legal_", "")
        await db.legalConsultation
          .update({ where: { id }, data: { status: "IN_PROGRESS" } })
          .catch(() => {})
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const success = url.searchParams.get("success")
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://areep-git-main-qareep.vercel.app"
  return NextResponse.redirect(
    `${base}/ar/dashboard?payment=${success === "true" ? "ok" : "fail"}`
  )
}
