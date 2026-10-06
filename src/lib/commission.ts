/**
 * Commission calculation engine for Areep (قريب)
 * Rules are enforced strictly on the server side.
 * Never trust client-side calculations.
 */

export type CommissionType =
  | "STANDARD"
  | "CARS_PARTS"
  | "REAL_ESTATE_RENT"
  | "REAL_ESTATE_SALE"

export interface CommissionInput {
  amount: number // Sale/rent amount in EGP
  commissionType: CommissionType
  useEscrow: boolean
  // For rent only
  monthlyRent?: number
}

export interface CommissionResult {
  sellerCommission: number
  buyerCommission: number
  platformFee: number // Total that goes to Areep
  legalFee: number // Half of platform fee for real estate legal consultant
  sellerReceives: number // Amount seller gets after deductions
  buyerPaysTotal: number // What buyer must pay (amount + buyer commission if any)
  breakdown: {
    rule: string
    details: string
  }
}

/**
 * Calculate commissions according to business rules.
 * This function is the single source of truth.
 */
export function calculateCommission(input: CommissionInput): CommissionResult {
  const { amount, commissionType, useEscrow, monthlyRent } = input

  let sellerCommission = 0
  let buyerCommission = 0
  let legalFee = 0
  let rule = ""
  let details = ""

  switch (commissionType) {
    case "STANDARD":
      // Fixed 2% on seller only
      sellerCommission = amount * 0.02
      rule = "STANDARD_2_PERCENT"
      details = "عمولة ثابتة 2% على البائع فقط"
      break

    case "CARS_PARTS":
      // Cars, Car Parts, Motorcycles, Motorcycle Parts
      if (useEscrow) {
        sellerCommission = amount * 0.025
        buyerCommission = amount * 0.025
        rule = "CARS_ESCROW_2.5_EACH"
        details = "نظام وسيط قريب: 2.5% من البائع + 2.5% من المشتري"
      } else {
        sellerCommission = amount * 0.02
        rule = "CARS_NO_ESCROW_2_PERCENT"
        details = "بدون نظام وسيط: 2% على البائع فقط"
      }
      break

    case "REAL_ESTATE_RENT":
      // Half month from landlord + half month from tenant
      const rent = monthlyRent || amount
      sellerCommission = rent * 0.5 // landlord
      buyerCommission = rent * 0.5 // tenant
      legalFee = (sellerCommission + buyerCommission) * 0.5 // Half to legal consultant
      rule = "RENT_HALF_MONTH_EACH"
      details = "إيجار: نصف شهر من المؤجر + نصف شهر من المستأجر (نصف العمولة للمستشار القانوني)"
      break

    case "REAL_ESTATE_SALE":
      if (useEscrow) {
        sellerCommission = amount * 0.025
        buyerCommission = amount * 0.025
        legalFee = (sellerCommission + buyerCommission) * 0.5
        rule = "SALE_ESCROW_2.5_EACH"
        details = "تمليك بنظام وسيط: 2.5% بائع + 2.5% مشتري (نصف العمولة للمستشار القانوني)"
      } else {
        sellerCommission = amount * 0.02
        legalFee = sellerCommission * 0.5
        rule = "SALE_NO_ESCROW_2_PERCENT"
        details = "تمليك بدون وسيط: 2% على البائع فقط (نصف العمولة للمستشار القانوني)"
      }
      break

    default:
      sellerCommission = amount * 0.02
      rule = "FALLBACK_2_PERCENT"
      details = "القاعدة الافتراضية 2%"
  }

  const platformFee = sellerCommission + buyerCommission
  const sellerReceives = amount - sellerCommission
  const buyerPaysTotal = amount + buyerCommission

  return {
    sellerCommission: round(sellerCommission),
    buyerCommission: round(buyerCommission),
    platformFee: round(platformFee),
    legalFee: round(legalFee),
    sellerReceives: round(sellerReceives),
    buyerPaysTotal: round(buyerPaysTotal),
    breakdown: { rule, details },
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Categories mapping to commission types
 * Order is fixed as requested:
 * 1. Cars
 * 2. Car Parts
 * 3. Motorcycles & Tricycles
 * 4. Motorcycle/Tricycle Parts
 * 5. Real Estate (Rent & Sale)
 */
export const CATEGORY_COMMISSION_MAP: Record<string, CommissionType> = {
  cars: "CARS_PARTS",
  "car-parts": "CARS_PARTS",
  motorcycles: "CARS_PARTS",
  "motorcycle-parts": "CARS_PARTS",
  "real-estate-rent": "REAL_ESTATE_RENT",
  "real-estate-sale": "REAL_ESTATE_SALE",
  // Everything else
  mobiles: "STANDARD",
  electronics: "STANDARD",
  furniture: "STANDARD",
  fashion: "STANDARD",
  pets: "STANDARD",
  jobs: "STANDARD",
  services: "STANDARD",
  other: "STANDARD",
}
