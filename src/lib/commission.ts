/**
 * عمولة قريب الثابتة:
 * - افتراضي: 2% على البائع فقط لأي بيعة
 * - استثناءات فقط:
 *   سيارات / قطع غيار / موتسيكلات وقطعها:
 *     مع وسيط: 2.5% بائع + 2.5% مشتري
 *     بدون وسيط: 2% بائع فقط
 *   عقارات إيجار: نصف شهر من كل طرف
 *   عقارات تمليك:
 *     مع وسيط: 2.5% + 2.5%
 *     بدون وسيط: 2% بائع فقط
 *
 * مستوى التوثيق (أساسي/موثّق) يؤثر فقط على سقف قيمة الطلب — ليس نسبة العمولة.
 */

export type CommissionResult = {
  sellerPercent: number
  buyerPercent: number
  rentMonthsEach?: number
  noteAr: string
  noteEn: string
}

export function calcCommission(opts: {
  categorySlug?: string
  commissionType?: string
  allowEscrow?: boolean
}): CommissionResult {
  const slug = (opts.categorySlug || "").toLowerCase()
  const type = opts.commissionType || "STANDARD"
  const escrow = Boolean(opts.allowEscrow)

  const isCars =
    type === "CARS_PARTS" ||
    ["cars", "car-parts", "motorcycles", "motorcycle-parts"].includes(slug)
  const isRent =
    type === "REAL_ESTATE_RENT" || slug.includes("rent") || slug === "real-estate-rent"
  const isSale =
    type === "REAL_ESTATE_SALE" || slug.includes("sale") || slug === "real-estate-sale"

  if (isRent) {
    return {
      sellerPercent: 0,
      buyerPercent: 0,
      rentMonthsEach: 0.5,
      noteAr: "إيجار: نصف شهر من المؤجر + نصف شهر من المستأجر",
      noteEn: "Rent: half month from each party",
    }
  }

  if (isCars || isSale) {
    if (escrow) {
      return {
        sellerPercent: 2.5,
        buyerPercent: 2.5,
        noteAr: "مع وسيط قريب: 2.5% بائع + 2.5% مشتري",
        noteEn: "With escrow: 2.5% seller + 2.5% buyer",
      }
    }
    return {
      sellerPercent: 2,
      buyerPercent: 0,
      noteAr: "بدون وسيط: 2% على البائع فقط",
      noteEn: "Without escrow: 2% seller only",
    }
  }

  // Standard: always 2% seller only
  return {
    sellerPercent: 2,
    buyerPercent: 0,
    noteAr: "عمولة ثابتة 2% على البائع",
    noteEn: "Fixed 2% on seller",
  }
}

/** سقف قيمة الطلب حسب مستوى التوثيق — لا يغيّر العمولة */
export function maxOrderValueForBadge(badge: string | null | undefined): number | null {
  // BASIC = 25000 EGP ceiling; VERIFIED = unlimited
  if (badge === "BASIC") return 25000
  if (badge === "VERIFIED" || badge === "VERIFIED_LEGAL" || badge === "PRO") return null
  return 25000 // default basic ceiling for new sellers
}
