import { NextRequest, NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const items = await db.category.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => [])
  return NextResponse.json({ success: true, items })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
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

/** Reorder: body.order = [{ id, sortOrder }, ...] */
export async function PATCH(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))

  if (Array.isArray(body.order)) {
    for (const row of body.order) {
      if (!row?.id) continue
      await db.category
        .update({
          where: { id: row.id },
          data: { sortOrder: Number(row.sortOrder) || 0 },
        })
        .catch(() => null)
    }
    return NextResponse.json({ success: true })
  }

  if (body.id && typeof body.isActive === "boolean") {
    await db.category.update({
      where: { id: body.id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid body" }, { status: 400 })
}
