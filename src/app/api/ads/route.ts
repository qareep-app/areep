import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


/**
 * POST /api/ads - Create a new ad
 * GET /api/ads - List ads (optional filters)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      titleAr,
      titleEn,
      descriptionAr,
      descriptionEn,
      price,
      categorySlug,
      city,
      area,
      allowEscrow,
      condition,
      images,
      userId, // temporary until full auth
    } = body

    if (!titleAr || !descriptionAr || !price || !categorySlug || !city) {
      return NextResponse.json(
        { error: "الحقول المطلوبة ناقصة: العنوان، الوصف، السعر، الفئة، المدينة" },
        { status: 400 }
      )
    }

    // Find category
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })

    if (!category) {
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 400 })
    }

    // Ensure we have a user (dev fallback: create guest user by phone or use first admin)
    let user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null

    if (!user) {
      // Create or get a temporary guest user for testing
      user = await prisma.user.upsert({
        where: { phone: "01000000000" },
        update: {},
        create: {
          phone: "01000000000",
          name: "مستخدم تجريبي",
          role: "USER",
        },
      })
    }

    const ad = await prisma.ad.create({
      data: {
        titleAr,
        titleEn: titleEn || titleAr,
        descriptionAr,
        descriptionEn: descriptionEn || null,
        price: Number(price),
        currency: "EGP",
        condition: condition || "USED",
        status: "ACTIVE",
        city,
        area: area || null,
        allowEscrow: Boolean(allowEscrow),
        images: Array.isArray(images) ? images : [],
        categoryId: category.id,
        userId: user.id,
      },
      include: {
        category: true,
        user: { select: { id: true, name: true, phone: true } },
      },
    })

    return NextResponse.json({ success: true, ad }, { status: 201 })
  } catch (error: any) {
    console.error("Create ad error:", error)
    return NextResponse.json(
      { error: error?.message || "فشل إنشاء الإعلان" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const city = searchParams.get("city")
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50)

    const ads = await prisma.ad.findMany({
      where: {
        status: "ACTIVE",
        ...(category ? { category: { slug: category } } : {}),
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      },
      include: {
        category: true,
        user: { select: { id: true, name: true, rating: true, trustBadge: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    })

    return NextResponse.json({ success: true, ads })
  } catch (error: any) {
    console.error("List ads error:", error)
    return NextResponse.json(
      { error: error?.message || "فشل جلب الإعلانات" },
      { status: 500 }
    )
  }
}
