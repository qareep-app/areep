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
      latitude,
      longitude,
      allowEscrow,
      condition,
      images,
      videos,
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

    const ad = await (prisma as any).ad.create({
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
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        allowEscrow: Boolean(allowEscrow),
        images: Array.isArray(images) ? images : [],
        videos: Array.isArray(videos) ? videos : [],
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
    const gov = searchParams.get("gov")
    const q = searchParams.get("q")
    const min = searchParams.get("min")
    const max = searchParams.get("max")
    const sort = searchParams.get("sort") || "newest"
    const brand = searchParams.get("brand")
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50)

    const priceFilter: any = {}
    if (min != null && min !== "" && !Number.isNaN(Number(min))) priceFilter.gte = Number(min)
    if (max != null && max !== "" && !Number.isNaN(Number(max))) priceFilter.lte = Number(max)

    const orSearch = q
      ? [
          { titleAr: { contains: q, mode: "insensitive" as const } },
          { descriptionAr: { contains: q, mode: "insensitive" as const } },
          { city: { contains: q, mode: "insensitive" as const } },
          { area: { contains: q, mode: "insensitive" as const } },
        ]
      : undefined

    let orderBy: any = [{ isFeatured: "desc" }, { createdAt: "desc" }]
    if (sort === "price_asc") orderBy = [{ price: "asc" }]
    if (sort === "price_desc") orderBy = [{ price: "desc" }]
    // nearby: still newest until geo sort is wired
    if (sort === "nearby") orderBy = [{ createdAt: "desc" }]

    const ads = await prisma.ad.findMany({
      where: {
        status: "ACTIVE",
        ...(category ? { category: { slug: category } } : {}),
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(gov ? { city: { contains: gov, mode: "insensitive" } } : {}),
        ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
        ...(orSearch ? { OR: orSearch } : {}),
        ...(brand
          ? {
              OR: [
                { titleAr: { contains: brand, mode: "insensitive" } },
                { descriptionAr: { contains: brand, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        user: { select: { id: true, name: true, rating: true, trustBadge: true } },
      },
      orderBy,
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
