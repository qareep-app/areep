"use client"

import { useState } from "react"
import { CreditCard, Loader2 } from "lucide-react"

interface Props {
  locale?: string
  type: "escrow" | "commission" | "legal"
  amount: number
  referenceId?: string
  label?: string
}

export default function PayButton({
  locale = "ar",
  type,
  amount,
  referenceId,
  label,
}: Props) {
  const isRtl = locale === "ar"
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const pay = async () => {
    setLoading(true)
    setMsg("")
    try {
      const res = await fetch("/api/paymob/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, referenceId }),
      })
      const data = await res.json()
      if (res.status === 503) {
        setMsg(
          isRtl
            ? "Paymob غير مضبوط بعد — أضف المفاتيح في Vercel"
            : "Paymob not configured — add keys in Vercel"
        )
        return
      }
      if (!res.ok) throw new Error(data.error || "Payment failed")

      // Intention API may return client_secret / payment_keys
      const iframe =
        data.iframeUrl ||
        data.intention?.iframeUrl ||
        data.intention?.iframe_url ||
        null

      if (typeof iframe === "string" && iframe.startsWith("http")) {
        window.location.href = iframe
        return
      }
      setMsg(
        isRtl
          ? data.error || "تم إنشاء الطلب لكن رابط الدفع غير متاح — راجع INTEGRATION_ID و IFRAME_ID"
          : data.error || "Payment created but no iframe URL"
      )
      console.log("Paymob response", data)
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={pay}
        disabled={loading || amount < 1}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {label ||
          (isRtl
            ? `ادفع ${amount.toLocaleString()} ج.م`
            : `Pay ${amount.toLocaleString()} EGP`)}
      </button>
      {msg && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">{msg}</p>}
    </div>
  )
}
