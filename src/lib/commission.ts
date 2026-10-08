/**
 * عمولة قريب:
 * - افتراضي: 2% على البائع فقط
 * - سيارات / قطع غيار / موتسيكلات:
 *     مع وسيط: 2.5% بائع + 2.5% مشتري
 *     بدون وسيط: 2% بائع فقط
 * - عقارات إيجار: نصف شهر من كل طرف
 * - عقارات تمليك: مع وسيط 2.5%+2.5% / بدون 2% بائع
 * مستوى التوثيق يؤثر على سقف الطلب فقط — ليس نسبة العمولة.
 */

export type CommissionType =
  | "STANDARD"
  | "CARS_PARTS"
  | "REAL_ESTATE_SALE"
  | "REAL_ESTATE_RENT"

export type CommissionResult = {
  sellerPercent: number
  buyerPercent: number
  sellerAmount?: number
  buyerAmount?: number
  totalCommission?: number
  rentMonthsEach?: number
  noteAr: string
  noteEn: string
}

export function calculateCommission(opts: {
  price?: number
  amount?: number
  categorySlug?: string
  commissionType?: CommissionType | string
  allowEscrow?: boolean
  useEscrow?: boolean
}): CommissionResult {
  const slug = (opts.categorySlug || "").toLowerCase()
  const type = (opts.commissionType || "STANDARD") as string
  const escrow = Boolean(opts.allowEscrow ?? opts.useEscrow)
  const price = Number(opts.price ?? opts.amount ?? 0)

  const isCars =
    type === "CARS_PARTS" ||
    ["cars", "car-parts", "motorcycles", "motorcycle-parts"].includes(slug)
  const isRent =
    type === "REAL_ESTATE_RENT" ||
    slug.includes("rent") ||
    slug === "real-estate-rent"
  const isSale =
    type === "REAL_ESTATE_SALE" ||
    slug.includes("sale") ||
    slug === "real-estate-sale"

  let result: CommissionResult

  if (isRent) {
    result = {
      sellerPercent: 0,
      buyerPercent: 0,
      rentMonthsEach: 0.5,
      noteAr: "إيجار: نصف شهر من المؤجر + نصف شهر من المستأجر",
      noteEn: "Rent: half month from each party",
    }
  } else if (isCars || isSale) {
    if (escrow) {
      result = {
        sellerPercent: 2.5,
        buyerPercent: 2.5,
        noteAr: "مع وسيط قريب: 2.5% بائع + 2.5% مشتري",
        noteEn: "With escrow: 2.5% seller + 2.5% buyer",
      }
    } else {
      result = {
        sellerPercent: 2,
        buyerPercent: 0,
        noteAr: "بدون وسيط: 2% على البائع فقط",
        noteEn: "Without escrow: 2% seller only",
      }
    }
  } else {
    result = {
      sellerPercent: 2,
      buyerPercent: 0,
      noteAr: "عمولة ثابتة 2% على البائع",
      noteEn: "Fixed 2% on seller",
    }
  }

  if (price > 0) {
    result.sellerAmount = Math.round(price * (result.sellerPercent / 100) * 100) / 100
    result.buyerAmount = Math.round(price * (result.buyerPercent / 100) * 100) / 100
    result.totalCommission =
      Math.round(((result.sellerAmount || 0) + (result.buyerAmount || 0)) * 100) / 100
  }

  return result
}

/** alias */
export const calcCommission = calculateCommission

/** سقف قيمة الطلب حسب مستوى التوثيق — لا يغيّر العمولة */
export function maxOrderValueForBadge(badge: string | null | undefined): number | null {
  if (badge === "BASIC") return 25000
  if (badge === "VERIFIED" || badge === "VERIFIED_LEGAL" || badge === "PRO") return null
  return 25000
}
