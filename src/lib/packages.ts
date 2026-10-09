import { prisma } from "@/lib/prisma"

const db = prisma as any

const PACKAGE_META: Record<
  string,
  { price: number; durationDays: number; maxAds: number | null; featuredAds: number }
> = {
  free: { price: 0, durationDays: 30, maxAds: 5, featuredAds: 0 },
  basic: { price: 149, durationDays: 30, maxAds: 15, featuredAds: 3 },
  pro: { price: 349, durationDays: 30, maxAds: 40, featuredAds: 10 },
  cars: { price: 799, durationDays: 30, maxAds: null, featuredAds: 20 },
  realestate: { price: 599, durationDays: 30, maxAds: null, featuredAds: 15 },
}

export async function activateUserPackage(userId: string, packageSlug: string) {
  const meta = PACKAGE_META[packageSlug] || PACKAGE_META.basic
  const endDate = new Date(Date.now() + meta.durationDays * 24 * 60 * 60 * 1000)

  // Ensure Package row exists
  let pkg = await db.package.findUnique({ where: { slug: packageSlug } }).catch(() => null)
  if (!pkg) {
    pkg = await db.package.create({
      data: {
        slug: packageSlug,
        nameAr: packageSlug,
        nameEn: packageSlug,
        price: meta.price,
        durationDays: meta.durationDays,
        maxAds: meta.maxAds,
        featuredAds: meta.featuredAds,
        isActive: true,
      },
    })
  }

  // Deactivate previous
  await db.userPackage.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  }).catch(() => {})

  const up = await db.userPackage.create({
    data: {
      userId,
      packageId: pkg.id,
      startDate: new Date(),
      endDate,
      isActive: true,
      adsUsed: 0,
      featuredUsed: 0,
    },
  })

  return up
}

/** Parse merchant_order_id like package_basic_userId_timestamp_rand */
export function parsePackageOrderId(merchantOrderId: string): {
  packageSlug?: string
  userId?: string
} {
  if (!merchantOrderId.startsWith("package_")) return {}
  const parts = merchantOrderId.split("_")
  // package_slug_userId_ts_rand
  if (parts.length >= 4) {
    return { packageSlug: parts[1], userId: parts[2] }
  }
  if (parts.length >= 2) {
    return { packageSlug: parts[1] }
  }
  return {}
}
