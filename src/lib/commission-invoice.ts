import { prisma } from "@/lib/prisma"
import { calculateCommission } from "@/lib/commission"

const db = prisma as any

/** أيام السماح قبل اعتبار الفاتورة متأخرة */
export const COMMISSION_DUE_DAYS = 3

export function feeFromDealAmount(dealAmount: number, categorySlug?: string) {
  const amount = Number(dealAmount) || 0
  // بيع عادي بدون وسيط → قواعد بدون escrow
  const c = calculateCommission({
    price: amount,
    categorySlug,
    useEscrow: false,
  })
  // البائع يتحمل عمولته (عادة 2%)
  const feeAmount = c.sellerAmount || Math.round(amount * 0.02 * 100) / 100
  const feePercent = amount > 0 ? Math.round((feeAmount / amount) * 10000) / 100 : 2
  return { feeAmount, feePercent, noteAr: c.noteAr }
}

export async function getOverdueCommissionInvoices(sellerId: string) {
  const now = new Date()
  try {
    return await db.commissionInvoice.findMany({
      where: {
        sellerId,
        status: "PENDING",
        dueAt: { lt: now },
      },
      orderBy: { dueAt: "asc" },
    })
  } catch {
    return []
  }
}

export async function getPendingCommissionTotal(sellerId: string) {
  try {
    const rows = await db.commissionInvoice.findMany({
      where: { sellerId, status: "PENDING" },
      select: { feeAmount: true, dueAt: true },
    })
    const now = new Date()
    let pending = 0
    let overdue = 0
    for (const r of rows) {
      const n = Number(r.feeAmount)
      pending += n
      if (r.dueAt && new Date(r.dueAt) < now) overdue += n
    }
    return { pending, overdue, count: rows.length }
  } catch {
    return { pending: 0, overdue: 0, count: 0 }
  }
}

/** يمنع النشر/التمييز إذا فيه فاتورة متأخرة */
export async function assertNoOverdueCommissions(sellerId: string) {
  const overdue = await getOverdueCommissionInvoices(sellerId)
  if (overdue.length > 0) {
    const total = overdue.reduce((s: number, r: any) => s + Number(r.feeAmount), 0)
    return {
      ok: false as const,
      error: `لا يمكن النشر أو التمييز: لديك عمولات متأخرة بقيمة ${total.toLocaleString()} ج.م. سدّد الفواتير من «عمولاتي» أولاً.`,
      overdue,
      total,
    }
  }
  return { ok: true as const }
}

export async function createCommissionInvoice(opts: {
  sellerId: string
  adId?: string | null
  dealAmount: number
  categorySlug?: string
  source?: string
  note?: string
  dueDays?: number
}) {
  const { feeAmount, feePercent, noteAr } = feeFromDealAmount(
    opts.dealAmount,
    opts.categorySlug
  )
  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + (opts.dueDays ?? COMMISSION_DUE_DAYS))

  const inv = await db.commissionInvoice.create({
    data: {
      sellerId: opts.sellerId,
      adId: opts.adId || null,
      dealAmount: opts.dealAmount,
      feePercent,
      feeAmount,
      status: "PENDING",
      dueAt,
      source: opts.source || "COD",
      note: opts.note || noteAr,
    },
  })
  return inv
}

export async function markCommissionInvoicePaid(orderRef: string) {
  // commission_{invoiceId}_{ts}
  if (!orderRef.startsWith("commission_")) return false
  const id = orderRef.slice("commission_".length).split("_")[0]
  if (!id || id === "x") {
    // try by paymobOrderId
    await db.commissionInvoice
      .updateMany({
        where: { paymobOrderId: orderRef, status: "PENDING" },
        data: { status: "PAID", paidAt: new Date() },
      })
      .catch(() => {})
    return true
  }
  await db.commissionInvoice
    .updateMany({
      where: {
        OR: [{ id }, { paymobOrderId: orderRef }],
        status: "PENDING",
      },
      data: { status: "PAID", paidAt: new Date(), paymobOrderId: orderRef },
    })
    .catch(() => {})
  return true
}
