import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/health
 * Checks database connection and returns basic stats.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    const [categoriesCount, packagesCount, usersCount, adsCount] = await Promise.all([
      prisma.category.count(),
      prisma.package.count(),
      prisma.user.count(),
      prisma.ad.count(),
    ])

    return NextResponse.json(
      {
        ok: true,
        database: "connected",
        stats: {
          categories: categoriesCount,
          packages: packagesCount,
          users: usersCount,
          ads: adsCount,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error: any) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
        error: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    )
  }
}
