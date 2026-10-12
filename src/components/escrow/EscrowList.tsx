"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Shield, Loader2, Clock, CheckCircle, Wallet } from "lucide-react"

interface EscrowListProps {
  locale: string
}

const statusMap: Record<string, { ar: string; en: string; color: string; icon: any }> = {
  PENDING_PAYMENT: { ar: "في انتظار الدفع", en: "Awaiting payment", color: "bg-amber-50 text-amber-700", icon: Clock },
  HELD: { ar: "محجوز — انتظار التسليم", en: "Held — await delivery", color: "bg-blue-50 text-blue-700", icon: Wallet },
  DELIVERED: { ar: "تم التسليم", en: "Delivered", color: "bg-violet-50 text-violet-700", icon: CheckCircle },
  RELEASED: { ar: "مكتملة", en: "Completed", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
  COMPLETED: { ar: "مكتملة", en: "Completed", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
  CANCELLED: { ar: "ملغاة", en: "Cancelled", color: "bg-red-50 text-red-600", icon: Clock },
  DISPUTED: { ar: "نزاع", en: "Disputed", color: "bg-amber-50 text-amber-800", icon: Clock },
}

export default function EscrowList({ locale }: EscrowListProps) {
  const isRtl = locale === "ar"
  const search = useSearchParams()
  const startAd = search.get("ad")
  const wantStart = search.get("start") === "1"

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [startMsg, setStartMsg] = useState("")

  const load = () => {
    setLoading(true)
    fetch("/api/me/escrow", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!startAd || !wantStart) return
    let cancelled = false
    ;(async () => {
      setStarting(true)
      setStartMsg("")
      try {
        const r = await fetch("/api/escrow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ adId: startAd }),
        })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || "فشل بدء الصفقة")
        if (!cancelled && d.deal?.id) {
          window.location.href = `/${locale}/dashboard/escrow/${d.deal.id}`
        }
      } catch (e: any) {
        if (!cancelled) setStartMsg(e.message)
      } finally {
        if (!cancelled) setStarting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [startAd, wantStart, locale])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="text-emerald-600" size={26} />
          {isRtl ? "نظام الوسيط" : "Escrow"}
        </h1>
      </div>

      {(starting || startMsg) && (
        <div className="bg-white border rounded-xl p-4 text-sm">
          {starting && (
            <span className="inline-flex items-center gap-2 text-gray-600">
              <Loader2 className="animate-spin" size={16} />
              {isRtl ? "جاري إنشاء صفقة الوسيط..." : "Creating escrow deal..."}
            </span>
          )}
          {startMsg && <p className="text-red-600">{startMsg}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="font-semibold text-gray-900">{isRtl ? "كيف يعمل النظام؟" : "How it works?"}</h2>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>{isRtl ? "البائع يفعّل «وسيط قريب» على الإعلان" : "Seller enables escrow on the ad"}</li>
          <li>{isRtl ? "المشتري يختار الشراء بوسيط (اختياري)" : "Buyer chooses escrow (optional)"}</li>
          <li>{isRtl ? "المشتري يدفع قيمة السلعة + عمولته لحساب قريب عبر Paymob" : "Buyer pays price + fee to Areep via Paymob"}</li>
          <li>{isRtl ? "بعد التسليم: البائع يؤكد → المشتري يؤكد الاستلام" : "After delivery: seller confirms → buyer confirms receipt"}</li>
          <li>{isRtl ? "يُحرَّر صافي المبلغ للبائع بعد خصم عمولة قريب" : "Net amount released to seller after Areep fee"}</li>
        </ol>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b text-sm font-semibold text-gray-800">
          {isRtl ? "صفقاتي عبر وسيط" : "My escrow deals"}
        </div>

        {loading && (
          <div className="p-8 flex justify-center text-gray-400">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            {isRtl
              ? "مفيش صفقات وسيط لسه. من صفحة الإعلان اضغط «شراء بوسيط قريب» إذا كان مفعّلاً."
              : "No escrow deals yet. On an ad page, tap Buy with Escrow if enabled."}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="divide-y divide-gray-50">
            {items.map((esc) => {
              const st = statusMap[esc.status] || statusMap.PENDING_PAYMENT
              const Icon = st.icon
              const title = esc.ad?.titleAr || esc.titleAr || "—"
              const amount = Number(esc.amount || 0)
              const commission = Number(esc.commission || 0)
              return (
                <Link
                  key={esc.id}
                  href={`/${locale}/dashboard/escrow/${esc.id}`}
                  className="block p-4 sm:p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>
                          {amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700">
                          {isRtl ? "عمولة:" : "Fee:"} {commission.toLocaleString()}
                        </span>
                        <span>·</span>
                        <span>{esc.role === "buyer" ? (isRtl ? "مشتري" : "Buyer") : isRtl ? "بائع" : "Seller"}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}
                    >
                      <Icon size={13} />
                      {isRtl ? st.ar : st.en}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
