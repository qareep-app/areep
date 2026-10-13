import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { presenceCount, upstashConfigured } from "@/lib/upstash"

const db = prisma as any

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const since = new Date(Date.now() - 10 * 60 * 1000)
    const visitorsOnline = await presenceCount().catch(() => null)

    const [
      users,
      onlineUsers,
      ads,
      activeAds,
      sellersByRole,
      sellersByStatus,
      sellersPendingStatus,
      sellersPendingRole,
      sellerAppsPending,
      sellerAppsAll,
      banned,
      packages,
      escrow,
      escrowHeld,
      consultations,
      commissionPending,
      commissionPaid,
    ] = await Promise.all([
      db.user.count().catch(() => 0),
      db.user
        .count({ where: { lastActiveAt: { gte: since }, isBanned: false } })
        .catch(() => 0),
      db.ad.count().catch(() => 0),
      db.ad.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      // بائعين بالدور
      db.user
        .count({
          where: { role: { in: ["SELLER", "SELLER_PRO"] } },
        })
        .catch(() => 0),
      // بائعين بحالة موافقة
      db.user.count({ where: { sellerStatus: "APPROVED" } }).catch(() => 0),
      db.user.count({ where: { sellerStatus: "PENDING" } }).catch(() => 0),
      db.user.count({ where: { role: "SELLER_PENDING" } }).catch(() => 0),
      db.sellerApplication.count({ where: { status: "PENDING" } }).catch(() => 0),
      db.sellerApplication.count().catch(() => 0),
      db.user.count({ where: { isBanned: true } }).catch(() => 0),
      db.userPackage.count({ where: { isActive: true } }).catch(() => 0),
      db.escrowDeal.count().catch(() => 0),
      db.escrowDeal.count({ where: { status: "HELD" } }).catch(() => 0),
      db.legalConsultation.count().catch(() => 0),
      db.commissionInvoice.count({ where: { status: "PENDING" } }).catch(() => 0),
      db.commissionInvoice.count({ where: { status: "PAID" } }).catch(() => 0),
    ])

    // إجمالي البائعين = اتحاد الدور أو حالة الموافقة (بدون عد مزدوج تقريبي: نفضّل الأكبر + طلبات)
    // أدق: count distinct where role seller OR status approved
    let sellersAccurate = 0
    try {
      sellersAccurate = await db.user.count({
        where: {
          OR: [
            { role: { in: ["SELLER", "SELLER_PRO"] } },
            { sellerStatus: "APPROVED" },
          ],
        },
      })
    } catch {
      sellersAccurate = Math.max(sellersByRole, sellersByStatus)
    }

    const sellersPending = Math.max(
      sellersPendingStatus,
      sellersPendingRole,
      sellerAppsPending
    )

    return NextResponse.json({
      ok: true,
      stats: {
        users,
        onlineUsers,
        registeredAccounts: users,
        sellers: sellersAccurate,
        sellersByRole,
        sellersByStatus,
        sellersPending,
        sellerAppsPending,
        sellerAppsAll,
        banned,
        ads,
        activeAds,
        activePackages: packages,
        escrow,
        escrowHeld,
        consultations,
        commissionPending,
        commissionPaid,
        guestsOnline: visitorsOnline,
        visitorsOnline,
        upstash: upstashConfigured(),
        note: "sellers = role SELLER/SELLER_PRO أو sellerStatus APPROVED",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, stats: {} }, { status: 500 })
  }
}
