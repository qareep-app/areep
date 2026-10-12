"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Shield,
  CheckCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  AlertTriangle,
  Loader2,
  Wallet,
} from "lucide-react"

interface EscrowDetailProps {
  locale: string
  escrowId: string
}

const steps = [
  { key: "PENDING_PAYMENT", labelAr: "انتظار الدفع", labelEn: "Payment" },
  { key: "HELD", labelAr: "محجوز", labelEn: "Held" },
  { key: "DELIVERED", labelAr: "تم التسليم", labelEn: "Delivered" },
  { key: "RELEASED", labelAr: "مكتملة", labelEn: "Released" },
]

export default function EscrowDetail({ locale, escrowId }: EscrowDetailProps) {
  const isRtl = locale === "ar"
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const [data, setData] = useState<any>(null)

  const load = () => {
    setLoading(true)
    fetch(`/api/escrow/${escrowId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setMsg(d.error)
        else setData(d)
      })
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [escrowId])

  const act = async (action: string) => {
    setBusy(true)
    setMsg("")
    try {
      if (action === "pay") {
        const r = await fetch("/api/escrow/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ dealId: escrowId }),
        })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || "فشل الدفع")
        if (d.iframeUrl) {
          window.location.href = d.iframeUrl
          return
        }
        if (d.demo) {
          // اختبار بدون Paymob
          const r2 = await fetch("/api/escrow/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ dealId: escrowId, action: "mark_paid" }),
          })
          const d2 = await r2.json()
          if (!r2.ok) throw new Error(d2.error || "fail")
          setMsg(d2.message || "تم (وضع تجريبي)")
          load()
          return
        }
        throw new Error(d.message || "لا يوجد رابط دفع")
      }

      const r = await fetch("/api/escrow/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dealId: escrowId, action }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "فشل")
      setMsg(d.message || "تم")
      load()
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 p-8">
        <Loader2 className="animate-spin" size={18} />
        {isRtl ? "جاري التحميل..." : "Loading..."}
      </div>
    )
  }

  if (!data?.deal) {
    return (
      <div className="p-6 text-red-600">
        {msg || (isRtl ? "الصفقة غير موجودة" : "Deal not found")}
        <div className="mt-3">
          <Link href={`/${locale}/dashboard/escrow`} className="text-emerald-700 underline text-sm">
            {isRtl ? "رجوع" : "Back"}
          </Link>
        </div>
      </div>
    )
  }

  const deal = data.deal
  const ad = data.ad
  const role = deal.role as "buyer" | "seller" | "admin"
  const status = deal.status as string

  const stepIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === status)
  )
  const doneKeys = ["RELEASED", "COMPLETED"]
  const activeIndex = doneKeys.includes(status) ? steps.length - 1 : stepIndex

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/dashboard/escrow`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600"
      >
        {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {isRtl ? "رجوع للصفقات" : "Back to deals"}
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900">
              {ad?.titleAr || (isRtl ? "صفقة وسيط" : "Escrow deal")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRtl ? "رقم الصفقة:" : "Deal:"}{" "}
              <span className="font-mono text-xs" dir="ltr">
                {deal.id.slice(-10)}
              </span>
              {" · "}
              {role === "buyer" ? (isRtl ? "أنت المشتري" : "You are buyer") : isRtl ? "أنت البائع" : "You are seller"}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`text-center rounded-xl py-2 px-1 text-[11px] sm:text-xs font-medium ${
                i <= activeIndex
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              {isRtl ? s.labelAr : s.labelEn}
            </div>
          ))}
        </div>
      </div>

      {/* Amounts */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-xs text-gray-500">{isRtl ? "قيمة السلعة" : "Item price"}</div>
          <div className="text-xl font-bold mt-1">{Number(deal.amount).toLocaleString()} ج</div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-xs text-gray-500">{isRtl ? "يدفعه المشتري" : "Buyer pays"}</div>
          <div className="text-xl font-bold mt-1 text-emerald-700">
            {Number(deal.totalHeld).toLocaleString()} ج
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {isRtl ? "شامل عمولة المشتري" : "incl. buyer fee"} ({Number(deal.buyerCommission).toLocaleString()})
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-xs text-gray-500">{isRtl ? "يستلمه البائع" : "Seller receives"}</div>
          <div className="text-xl font-bold mt-1">
            {(Number(deal.amount) - Number(deal.sellerCommission)).toLocaleString()} ج
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {isRtl ? "بعد خصم" : "after"} {Number(deal.sellerCommission).toLocaleString()}
          </div>
        </div>
      </div>

      {deal.notes && (
        <p className="text-sm text-gray-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {deal.notes}
        </p>
      )}

      {msg && (
        <p className="text-sm text-emerald-800 bg-white border rounded-xl px-4 py-3">{msg}</p>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-semibold">{isRtl ? "الإجراءات" : "Actions"}</h2>

        {status === "PENDING_PAYMENT" && role === "buyer" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("pay")}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
            {isRtl ? "ادفع الآن عبر Paymob" : "Pay with Paymob"}
          </button>
        )}

        {status === "PENDING_PAYMENT" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("cancel")}
            className="w-full h-11 rounded-xl border text-red-600 font-medium"
          >
            {isRtl ? "إلغاء الصفقة" : "Cancel deal"}
          </button>
        )}

        {status === "HELD" && role === "seller" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("confirm_delivery")}
            className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            {isRtl ? "تأكيد تسليم السلعة" : "Confirm delivery"}
          </button>
        )}

        {(status === "HELD" || status === "DELIVERED") && role === "buyer" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("confirm_receipt")}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Wallet size={18} />}
            {isRtl ? "تأكيد الاستلام وتحرير المبلغ للبائع" : "Confirm receipt & release funds"}
          </button>
        )}

        {["HELD", "DELIVERED"].includes(status) && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("dispute")}
            className="w-full h-11 rounded-xl border border-amber-200 text-amber-800 font-medium inline-flex items-center justify-center gap-2"
          >
            <AlertTriangle size={16} />
            {isRtl ? "فتح نزاع" : "Open dispute"}
          </button>
        )}

        {status === "RELEASED" && (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl p-4 text-sm">
            <CheckCircle size={18} />
            {isRtl
              ? "الصفقة مكتملة. تم احتساب عمولة قريب وتحرير صافي المبلغ للبائع (التحويل البنكي يتم عبر تسوية Paymob/التشغيل)."
              : "Deal complete. Platform fee taken; net amount marked for seller release."}
          </div>
        )}

        {status === "HELD" && role === "buyer" && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} />
            {isRtl
              ? "المبلغ محجوز. بعد استلام السلعة اضغط تأكيد الاستلام."
              : "Funds held. Confirm receipt after you get the item."}
          </p>
        )}
      </div>
    </div>
  )
}
