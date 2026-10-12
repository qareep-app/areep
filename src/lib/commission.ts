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
  sellerAmount: number
  buyerAmount: number
  totalCommission: number
  rentMonthsEach?: number
  /** ما يدفعه المشتري الآن (السعر + عمولته) */
  buyerPaysTotal: number
  /** ما يستلمه البائع بعد الخصم */
  sellerReceives: number
  noteAr: string
  noteEn: string
  rule: string
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
    (slug.includes("sale") && slug.includes("estate")) ||
    slug === "real-estate-sale"

  let sellerPercent = 2
  let buyerPercent = 0
  let rentMonthsEach: number | undefined
  let noteAr = "عمولة ثابتة 2% على البائع"
  let noteEn = "Fixed 2% on seller"
  let rule = "STANDARD_2"

  if (isRent) {
    sellerPercent = 0
    buyerPercent = 0
    rentMonthsEach = 0.5
    noteAr = "إيجار: نصف شهر من المؤجر + نصف شهر من المستأجر"
    noteEn = "Rent: half month from each party"
    rule = "RENT_HALF_MONTH"
  } else if (isCars || isSale) {
    if (escrow) {
      sellerPercent = 2.5
      buyerPercent = 2.5
      noteAr = "مع وسيط قريب: 2.5% بائع + 2.5% مشتري"
      noteEn = "With escrow: 2.5% seller + 2.5% buyer"
      rule = "ESCROW_2_5_2_5"
    } else {
      sellerPercent = 2
      buyerPercent = 0
      noteAr = "بدون وسيط: 2% على البائع فقط"
      noteEn = "Without escrow: 2% seller only"
      rule = "NO_ESCROW_2"
    }
  } else if (escrow) {
    // وسيط على فئات أخرى: نفس 2% بائع (المشتري يدفع السعر كاملاً)
    sellerPercent = 2
    buyerPercent = 0
    noteAr = "وسيط: 2% على البائع من قيمة الصفقة"
    noteEn = "Escrow: 2% seller from deal amount"
    rule = "ESCROW_STANDARD_2"
  }

  let sellerAmount = 0
  let buyerAmount = 0

  if (isRent && price > 0) {
    // price = إيجار الشهر
    sellerAmount = Math.round(price * 0.5 * 100) / 100
    buyerAmount = Math.round(price * 0.5 * 100) / 100
  } else if (price > 0) {
    sellerAmount = Math.round(price * (sellerPercent / 100) * 100) / 100
    buyerAmount = Math.round(price * (buyerPercent / 100) * 100) / 100
  }

  const totalCommission = Math.round((sellerAmount + buyerAmount) * 100) / 100
  // المشتري يدفع: قيمة السلعة + عمولته (وعند الإيجار: شهر + نصف شهر عمولته)
  const buyerPaysTotal = Math.round((price + buyerAmount) * 100) / 100
  // البائع يستلم: قيمة السلعة - عمولته
  const sellerReceives = Math.round((price - sellerAmount) * 100) / 100

  return {
    sellerPercent,
    buyerPercent,
    sellerAmount,
    buyerAmount,
    totalCommission,
    rentMonthsEach,
    buyerPaysTotal,
    sellerReceives,
    noteAr,
    noteEn,
    rule,
  }
}

export const calcCommission = calculateCommission

/** سقف قيمة الطلب حسب مستوى التوثيق — لا يغيّر العمولة */
export function maxOrderValueForBadge(badge: string | null | undefined): number | null {
  if (badge === "BASIC") return 25000
  if (badge === "VERIFIED" || badge === "VERIFIED_LEGAL" || badge === "PRO") return null
  return 25000
}
