"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Receipt } from "lucide-react"

interface Props {
  locale: string
  adId: string
  sellerId: string
  price: number
  status?: string
}

export default function MarkSoldButton({ locale, adId, sellerId, price, status }: Props) {
  const isRtl = locale === "ar"
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const [done, setDone] = useState(status === "SOLD")

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => {})
  }, [])

  // owner check: same id or we need phone match - session id might differ
  const isOwner =
    me &&
    (me.id === sellerId ||
      (me.phone && sellerId && false)) // id match primary

  if (!me || me.id !== sellerId) {
    // still try after load — if not owner, render nothing
    if (me && me.id !== sellerId) return null
    if (!me) return null
  }

  if (done || status === "SOLD") {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
        <CheckCircle2 size={18} />
        {isRtl
          ? "تم تسجيل هذا الإعلان كمباع. راجع «عمولاتي» لسداد فاتورة العمولة إن وُجدت."
          : "Marked as sold. Check Commissions to pay the fee invoice if any."}
      </div>
    )
  }

  const onSold = async () => {
    const ok = window.confirm(
      isRtl
        ? `تأكيد: تم بيع الإعلان بقيمة ${Number(price).toLocaleString()} ج.م؟\nستُنشأ فاتورة عمولة (~2%) وعليك سدادها خلال 3 أيام وإلا يُمنع النشر/التمييز.`
        : `Confirm sold at ${Number(price).toLocaleString()} EGP?\nA ~2% commission invoice will be created (due in 3 days).`
    )
    if (!ok) return

    setBusy(true)
    setMsg("")
    try {
      const r = await fetch("/api/commission/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          adId,
          dealAmount: Number(price),
          source: "AD_SOLD_BUTTON",
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "فشل إنشاء الفاتورة")

      // mark ad SOLD
      await fetch(`/api/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "SOLD" }),
      }).catch(() => {})

      setDone(true)
      setMsg(
        isRtl
          ? `تم. فاتورة العمولة: ${Number(d.invoice?.feeAmount || 0).toLocaleString()} ج.م`
          : `Done. Fee invoice: ${Number(d.invoice?.feeAmount || 0).toLocaleString()} EGP`
      )
      setTimeout(() => {
        router.push(`/${locale}/dashboard/commissions`)
      }, 1200)
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2 border-t border-gray-100 pt-4">
      <p className="text-sm font-medium text-gray-700">
        {isRtl ? "للبائع فقط:" : "Seller only:"}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={onSold}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold disabled:opacity-50"
      >
        {busy ? <Loader2 className="animate-spin" size={18} /> : <Receipt size={18} />}
       {isRtl ? "تم البيع" : "Mark as sold"}
      </button>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
    </div>
  )
}
