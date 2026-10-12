import { prisma } from "@/lib/prisma"
import { assertNoOverdueCommissions } from "@/lib/commission-invoice"

const db = prisma as any

export const PACKAGE_META: Record<
  string,
  { price: number; durationDays: number; maxAds: number | null; featuredAds: number; nameAr: string; nameEn: string }
> = {
  free: {
    price: 0,
    durationDays: 30,
    maxAds: 5,
    featuredAds: 0,
    nameAr: "مجانية",
    nameEn: "Free",
  },
  basic: {
    price: 149,
    durationDays: 30,
    maxAds: 15,
    featuredAds: 3,
    nameAr: "أساسية",
    nameEn: "Basic",
  },
  pro: {
    price: 349,
    durationDays: 30,
    maxAds: 40,
    featuredAds: 10,
    nameAr: "احترافية",
    nameEn: "Professional",
  },
  cars: {
    price: 799,
    durationDays: 30,
    maxAds: null,
    featuredAds: 20,
    nameAr: "معارض سيارات",
    nameEn: "Car Dealers",
  },
  realestate: {
    price: 599,
    durationDays: 30,
    maxAds: null,
    featuredAds: 15,
    nameAr: "عقارات محترفة",
    nameEn: "Real Estate Pro",
  },
}

export function getPackageMeta(slug: string) {
  return PACKAGE_META[slug] || PACKAGE_META.free
}

export async function resolveDbUserId(session: { id: string; phone?: string | null }) {
  // Always prefer phone → DB user when phone exists (avoids tmp_/stale session id mismatch)
  if (session.phone) {
    try {
      const u = await db.user.upsert({
        where: { phone: session.phone },
        update: { lastActiveAt: new Date() },
        create: { phone: session.phone, role: "USER" },
      })
      return u.id as string
    } catch {
      /* fall through */
    }
  }
  return session.id as string
}

export async function ensurePackageRow(slug: string) {
  const meta = getPackageMeta(slug)
  let pkg = await db.package.findUnique({ where: { slug } }).catch(() => null)
  if (!pkg) {
    pkg = await db.package.create({
      data: {
        slug,
        nameAr: meta.nameAr,
        nameEn: meta.nameEn,
        price: meta.price,
        durationDays: meta.durationDays,
        maxAds: meta.maxAds,
        featuredAds: meta.featuredAds,
        isActive: true,
      },
    })
  } else {
    // keep meta in sync for featured/maxAds
    await db.package
      .update({
        where: { id: pkg.id },
        data: {
          maxAds: meta.maxAds,
          featuredAds: meta.featuredAds,
          price: meta.price,
          durationDays: meta.durationDays,
          nameAr: meta.nameAr,
          nameEn: meta.nameEn,
        },
      })
      .catch(() => null)
    pkg = await db.package.findUnique({ where: { slug } })
  }
  return pkg
}

/** Activate or renew a package for user */
export async function activateUserPackage(userId: string, packageSlug: string) {
  const meta = getPackageMeta(packageSlug)
  const pkg = await ensurePackageRow(packageSlug)
  const endDate = new Date(Date.now() + meta.durationDays * 24 * 60 * 60 * 1000)

  await db.userPackage
    .updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    })
    .catch(() => {})

  // Count current active ads for starting adsUsed
  const adsCount = await db.ad
    .count({ where: { userId, status: { in: ["ACTIVE", "PAUSED", "PENDING"] } } })
    .catch(() => 0)

  const up = await db.userPackage.create({
    data: {
      userId,
      packageId: pkg.id,
      startDate: new Date(),
      endDate,
      isActive: true,
      adsUsed: adsCount,
      featuredUsed: 0,
    },
  })

  // Auto-feature newest ads up to featured quota
  if (meta.featuredAds > 0) {
    const ads = await db.ad
      .findMany({
        where: { userId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: meta.featuredAds,
        select: { id: true },
      })
      .catch(() => [])

    if (ads.length) {
      await db.ad.updateMany({
        where: { id: { in: ads.map((a: any) => a.id) } },
        data: { isFeatured: true, featuredUntil: endDate },
      })
      await db.userPackage.update({
        where: { id: up.id },
        data: { featuredUsed: ads.length },
      })
    }
  }

  return await db.userPackage.findUnique({
    where: { id: up.id },
    include: { package: true },
  })
}

export async function getActiveUserPackage(userId: string) {
  let up = await db.userPackage.findFirst({
    where: { userId, isActive: true, endDate: { gte: new Date() } },
    include: { package: true },
    orderBy: { endDate: "desc" },
  })

  // Auto-grant free package if none
  if (!up) {
    up = await activateUserPackage(userId, "free")
  }
  return up
}

export type QuotaSnapshot = {
  userPackageId: string
  slug: string
  maxAds: number | null
  adsUsed: number
  adsRemaining: number | null
  featuredAds: number
  featuredUsed: number
  featuredRemaining: number
  endDate: Date | string | null
}

export async function getQuotaSnapshot(
  userId: string,
  phone?: string | null
): Promise<QuotaSnapshot> {
  const up = await getActiveUserPackage(userId)
  const maxAds = up.package?.maxAds ?? getPackageMeta(up.package?.slug || "free").maxAds
  const featuredAds = up.package?.featuredAds ?? getPackageMeta(up.package?.slug || "free").featuredAds

  // If ads were saved under a different userId (old session), re-link by phone
  if (phone) {
    try {
      await db.ad.updateMany({
        where: {
          userId: { not: userId },
          user: { phone },
        },
        data: { userId },
      })
    } catch {
      /* relation filter may fail on some drivers — ignore */
    }
  }

  const whereBase: any = phone
    ? {
        status: { in: ["ACTIVE", "PAUSED", "PENDING"] },
        OR: [{ userId }, { user: { phone } }],
      }
    : {
        userId,
        status: { in: ["ACTIVE", "PAUSED", "PENDING"] },
      }

  const realAds = await db.ad.count({ where: whereBase }).catch(() => up.adsUsed ?? 0)

  const realFeatured = await db.ad
    .count({
      where: { ...whereBase, isFeatured: true },
    })
    .catch(() => up.featuredUsed ?? 0)

  if (realAds !== (up.adsUsed ?? 0) || realFeatured !== (up.featuredUsed ?? 0)) {
    await db.userPackage
      .update({
        where: { id: up.id },
        data: { adsUsed: realAds, featuredUsed: realFeatured },
      })
      .catch(() => null)
  }

  return {
    userPackageId: up.id,
    slug: up.package?.slug || "free",
    maxAds: maxAds ?? null,
    adsUsed: realAds,
    adsRemaining: maxAds == null ? null : Math.max(0, maxAds - realAds),
    featuredAds: featuredAds ?? 0,
    featuredUsed: realFeatured,
    featuredRemaining: Math.max(0, (featuredAds ?? 0) - realFeatured),
    endDate: up.endDate,
  }
}

/** Throws-friendly check before creating an ad */
export async function assertCanPostAd(userId: string) {
  const overdueCheck = await assertNoOverdueCommissions(userId)
  if (!overdueCheck.ok) {
    return {
      ok: false as const,
      error: overdueCheck.error,
      quota: null as any,
      code: "COMMISSION_OVERDUE",
    }
  }
  const q = await getQuotaSnapshot(userId)
  if (q.maxAds != null && q.adsUsed >= q.maxAds) {
    return {
      ok: false as const,
      error: `وصلت للحد الأقصى من الإعلانات في باقتك (${q.maxAds}). رقّي الباقة لنشر المزيد.`,
      quota: q,
    }
  }
  return { ok: true as const, quota: q }
}

export async function recordAdCreated(userId: string, adId: string) {
  const up = await getActiveUserPackage(userId)
  const maxAds = up.package?.maxAds ?? null
  const featuredAds = up.package?.featuredAds ?? 0
  const featuredUsed = up.featuredUsed ?? 0

  const adsUsed = await db.ad
    .count({ where: { userId, status: { in: ["ACTIVE", "PAUSED", "PENDING"] } } })
    .catch(() => (up.adsUsed ?? 0) + 1)

  await db.userPackage.update({
    where: { id: up.id },
    data: { adsUsed },
  })

  // Auto feature if remaining and no overdue commission
  const od = await assertNoOverdueCommissions(userId)
  if (!od.ok) {
    return { featured: false, adsUsed, featuredUsed, blockedFeature: true }
  }
  if (featuredAds > featuredUsed) {
    const until = up.endDate || new Date(Date.now() + 30 * 864e5)
    await db.ad.update({
      where: { id: adId },
      data: { isFeatured: true, featuredUntil: until },
    })
    await db.userPackage.update({
      where: { id: up.id },
      data: { featuredUsed: featuredUsed + 1 },
    })
    return { featured: true, adsUsed, featuredUsed: featuredUsed + 1 }
  }

  return { featured: false, adsUsed, featuredUsed }
}

export function parsePackageOrderId(merchantOrderId: string): {
  packageSlug?: string
  userId?: string
} {
  if (!merchantOrderId.startsWith("package_")) return {}
  const parts = merchantOrderId.split("_")
  if (parts.length >= 4) {
    return { packageSlug: parts[1], userId: parts[2] }
  }
  if (parts.length >= 2) {
    return { packageSlug: parts[1] }
  }
  return {}
}
