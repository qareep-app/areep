import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

/**
 * POST /api/ads - Create a new ad (requires login)
 * GET /api/ads - List ads; ?mine=1 = only current user's ads
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json(
        { error: "سجّل دخول أولاً لنشر إعلان" },
        { status: 401 }
      )
    }

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
      attributes,
    } = body

    if (!titleAr || !descriptionAr || !price || !categorySlug || !city) {
      return NextResponse.json(
        { error: "الحقول المطلوبة ناقصة: العنوان، الوصف، السعر، الفئة، المدينة" },
        { status: 400 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })
    if (!category) {
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 400 })
    }

    // Ensure user exists in DB (session id might be tmp_ for offline)
    let userId = session.id
    if (userId.startsWith("tmp_")) {
      const phone = session.phone
      const u = await prisma.user.upsert({
        where: { phone },
        update: {},
        create: {
          phone,
          name: session.name || null,
          role: session.role === "ADMIN" ? "ADMIN" : "USER",
        },
      })
      userId = u.id
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
        attributes: attributes || null,
        categoryId: category.id,
        userId,
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
    const condition = searchParams.get("condition")
    const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true"
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50)

    let ownerUserId: string | null = null
    if (mine) {
      const session = await getSession()
      if (!session?.id) {
        return NextResponse.json({ success: true, ads: [], mine: true })
      }
      ownerUserId = session.id
      // resolve tmp_ ids
      if (ownerUserId.startsWith("tmp_")) {
        const u = await prisma.user.findUnique({ where: { phone: session.phone } }).catch(() => null)
        ownerUserId = u?.id || ownerUserId
      }
    }

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
    if (sort === "nearby") orderBy = [{ createdAt: "desc" }]

    const ads = await prisma.ad.findMany({
      where: {
        // For "my ads" show all statuses of this user; public list only ACTIVE
        ...(mine
          ? { userId: ownerUserId! }
          : { status: "ACTIVE" }),
        ...(category ? { category: { slug: category } } : {}),
        ...(condition ? { condition } : {}),
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

    return NextResponse.json({ success: true, ads, mine })
  } catch (error: any) {
    console.error("List ads error:", error)
    return NextResponse.json(
      { error: error?.message || "فشل جلب الإعلانات" },
      { status: 500 }
    )
  }
}
