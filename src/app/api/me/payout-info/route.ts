import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { resolveDbUserId } from "@/lib/packages"
import { prisma } from "@/lib/prisma"

const db = prisma as any

const fields = [
  "bankName",
  "bankAccountName",
  "bankAccountNumber",
  "bankIban",
  "walletType",
  "walletNumber",
] as const

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "login" }, { status: 401 })
  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        bankName: true,
        bankAccountName: true,
        bankAccountNumber: true,
        bankIban: true,
        walletType: true,
        walletNumber: true,
        name: true,
        phone: true,
      },
    })
    const complete = Boolean(
      user &&
        ((user.bankAccountNumber && user.bankAccountName) ||
          (user.walletType && user.walletNumber))
    )
    return NextResponse.json({ ok: true, payout: user, complete })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "login" }, { status: 401 })
  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const body = await req.json().catch(() => ({}))
    const data: any = {}
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = String(body[f] || "").trim() || null
    }
    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "لا بيانات" }, { status: 400 })
    }
    const user = await db.user.update({
      where: { id: userId },
      data,
      select: {
        bankName: true,
        bankAccountName: true,
        bankAccountNumber: true,
        bankIban: true,
        walletType: true,
        walletNumber: true,
      },
    })
    return NextResponse.json({ ok: true, payout: user })
  } catch (e: any) {
    console.error("payout-info", e)
    return NextResponse.json(
      {
        error:
          e?.message?.includes("Unknown arg") || e?.message?.includes("column")
            ? "شغّل: npx prisma db push — حقول البنك لسه مش في قاعدة البيانات"
            : e?.message,
      },
      { status: 500 }
    )
  }
}
