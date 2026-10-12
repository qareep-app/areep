import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json({ success: true, categories })
  } catch (e: any) {
    return NextResponse.json({ success: false, categories: [], error: e?.message })
  }
}
