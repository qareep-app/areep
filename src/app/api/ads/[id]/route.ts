import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, rating: true, trustBadge: true } },
      },
    })

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 })
    }

    // increment views (fire and forget)
    prisma.ad.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})

    return NextResponse.json({ success: true, ad })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error" }, { status: 500 })
  }
}
