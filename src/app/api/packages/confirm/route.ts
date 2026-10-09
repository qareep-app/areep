import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { activateUserPackage } from "@/lib/packages"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "سجّل دخول أولاً" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    let packageSlug = body.packageSlug as string | undefined
    let userId = session.id

    // From pending cookie set at payment create
    const pending = req.cookies.get("areep_pending_pkg")?.value
    if (pending) {
      const [slug, uid] = pending.split("|")
      if (slug) packageSlug = packageSlug || slug
      if (uid && uid !== "guest") userId = uid
    }

    if (!packageSlug) {
      return NextResponse.json({ error: "لا توجد باقة معلّقة" }, { status: 400 })
    }

    // Only activate for the logged-in user
    if (userId !== session.id && session.role !== "ADMIN") {
      userId = session.id
    }

    const up = await activateUserPackage(session.id, packageSlug)

    const res = NextResponse.json({
      ok: true,
      packageSlug,
      userPackage: up,
      message: "تم تفعيل الباقة",
    })
    res.cookies.set("areep_pending_pkg", "", { path: "/", maxAge: 0 })
    return res
  } catch (e: any) {
    console.error("confirm package", e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ active: null })
  }
  try {
    const { prisma } = await import("@/lib/prisma")
    const db = prisma as any
    const active = await db.userPackage.findFirst({
      where: { userId: session.id, isActive: true },
      include: { package: true },
      orderBy: { startDate: "desc" },
    })
    return NextResponse.json({ ok: true, active })
  } catch (e: any) {
    return NextResponse.json({ active: null, error: e?.message })
  }
}
