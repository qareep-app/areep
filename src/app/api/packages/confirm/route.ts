import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { activateUserPackage, resolveDbUserId, getQuotaSnapshot } from "@/lib/packages"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    let packageSlug = (body.packageSlug || body.packageId) as string | undefined

    const pending = req.cookies.get("areep_pending_pkg")?.value
    if (pending) {
      const [slug] = pending.split("|")
      if (slug) packageSlug = packageSlug || slug
    }

    if (!packageSlug) {
      return NextResponse.json({ error: "لا توجد باقة معلّقة" }, { status: 400 })
    }

    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const up = await activateUserPackage(userId, packageSlug)
    const quota = await getQuotaSnapshot(userId)

    const res = NextResponse.json({
      ok: true,
      packageSlug,
      userPackage: up,
      quota,
      message: "تم تفعيل الباقة",
    })
    res.cookies.set("areep_pending_pkg", "", { path: "/", maxAge: 0 })
    return res
  } catch (e: any) {
    console.error("confirm package", e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ active: null })
  try {
    const userId = await resolveDbUserId({ id: session.id, phone: session.phone })
    const { getActiveUserPackage } = await import("@/lib/packages")
    const active = await getActiveUserPackage(userId)
    return NextResponse.json({ ok: true, active })
  } catch (e: any) {
    return NextResponse.json({ active: null, error: e?.message })
  }
}
