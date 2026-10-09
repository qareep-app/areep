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
    const specialRef = String(
      body?.special_reference ||
        body?.obj?.order?.merchant_order_id ||
        body?.merchant_order_id ||
        ""
    )

    console.log("paymob webhook", { success, specialRef })

    if (success && specialRef) {
      if (specialRef.startsWith("escrow_")) {
        const parts = specialRef.split("_")
        const id = parts[1]
        if (id && id !== "x") {
          await db.escrowDeal
            .updateMany({ where: { id }, data: { status: "HELD" } })
            .catch(() => {})
        }
      }
      if (specialRef.startsWith("legal_")) {
        const parts = specialRef.split("_")
        const id = parts[1]
        if (id && id !== "x") {
          await db.legalConsultation
            .updateMany({ where: { id }, data: { status: "IN_PROGRESS" } })
            .catch(() => {})
        }
      }
      // package_* → optional future activation
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const success = url.searchParams.get("success")
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://areep.vercel.app"
  return NextResponse.redirect(
    `${base}/ar/payment/result?success=${success === "true" ? "true" : "false"}`
  )
}
