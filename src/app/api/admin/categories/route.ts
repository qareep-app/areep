import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const db = prisma as any

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const items = await db.category.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => [])
  return NextResponse.json({ success: true, items })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
  const nameAr = String(body.nameAr || "").trim()
  const nameEn = String(body.nameEn || nameAr).trim()
  if (!slug || !nameAr) {
    return NextResponse.json({ error: "slug and nameAr required" }, { status: 400 })
  }
  const maxSort = await db.category
    .aggregate({ _max: { sortOrder: true } })
    .catch(() => ({ _max: { sortOrder: 0 } }))
  const sortOrder = (maxSort?._max?.sortOrder || 0) + 1
  const item = await db.category.create({
    data: {
      slug,
      nameAr,
      nameEn,
      sortOrder,
      isActive: true,
      commissionType: body.commissionType || "STANDARD",
    },
  })
  return NextResponse.json({ success: true, item })
}
