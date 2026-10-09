import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { activateUserPackage, parsePackageOrderId } from "@/lib/packages"

const db = prisma as any

async function handleSuccess(specialRef: string) {
  if (!specialRef) return

  if (specialRef.startsWith("package_")) {
    const { packageSlug, userId } = parsePackageOrderId(specialRef)
    if (packageSlug && userId && userId !== "guest") {
      try {
        await activateUserPackage(userId, packageSlug)
        console.log("package activated", packageSlug, userId)
      } catch (e) {
        console.error("package activate failed", e)
      }
    }
  }

  if (specialRef.startsWith("escrow_")) {
    const id = specialRef.split("_")[1]
    if (id && id !== "x") {
      await db.escrowDeal
        .updateMany({ where: { id }, data: { status: "HELD" } })
        .catch(() => {})
    }
  }

  if (specialRef.startsWith("legal_")) {
    const id = specialRef.split("_")[1]
    if (id && id !== "x") {
      await db.legalConsultation
        .updateMany({ where: { id }, data: { status: "IN_PROGRESS" } })
        .catch(() => {})
    }
  }
}

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
        body?.obj?.merchant_order_id ||
        ""
    )

    console.log("paymob webhook POST", { success, specialRef })
    if (success) await handleSuccess(specialRef)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

/** Paymob browser redirect after payment */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const success =
    url.searchParams.get("success") === "true" ||
    url.searchParams.get("data.message") === "APPROVED"
  const merchantOrderId =
    url.searchParams.get("merchant_order_id") ||
    url.searchParams.get("order") ||
    ""

  if (success && merchantOrderId) {
    await handleSuccess(merchantOrderId).catch(() => {})
  }

  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://areep.vercel.app").replace(
    /\/$/,
    ""
  )
  return NextResponse.redirect(
    `${base}/ar/payment/result?success=${success ? "true" : "false"}`
  )
}
