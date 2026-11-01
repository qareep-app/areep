"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Smartphone, Building2, CheckCircle2, Copy } from "lucide-react"
const PACKAGE_META: Record<string, { price: number; nameAr: string; nameEn: string }> = {
  free: { price: 0, nameAr: "مجانية", nameEn: "Free" },
  basic: { price: 149, nameAr: "أساسية", nameEn: "Basic" },
  pro: { price: 349, nameAr: "احترافية", nameEn: "Professional" },
  cars: { price: 799, nameAr: "معارض سيارات", nameEn: "Car Dealers" },
  realestate: { price: 599, nameAr: "عقارات محترفة", nameEn: "Real Estate Pro" },
}

export default function ManualPackagePay({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const search = useSearchParams()
  const router = useRouter()
  const slug = (search.get("pkg") || "basic").trim()
  const meta = PACKAGE_META[slug] || PACKAGE_META.basic

  const instapay =
    process.env.NEXT_PUBLIC_MANUAL_INSTAPAY || "010xxxxxxxx"
  const vodafone =
    process.env.NEXT_PUBLIC_MANUAL_VODAFONE || "010xxxxxxxx"
  const payName =
    process.env.NEXT_PUBLIC_MANUAL_PAYMENT_NAME || (isRtl ? "قريب" : "Areep")

  const [method, setMethod] = useState<"instapay" | "vodafone">("instapay")
  const [reference, setReference] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const [ok, setOk] = useState(false)
  const [mine, setMine] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/packages/manual-request", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMine(d.requests || []))
      .catch(() => {})
  }, [ok])

  const number = method === "instapay" ? instapay : vodafone

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number)
      setMsg(isRtl ? "تم نسخ الرقم" : "Copied")
    } catch {
      setMsg(number)
    }
  }

  const submit = async () => {
    setBusy(true)
    setMsg("")
    try {
      const res = await fetch("/api/packages/manual-request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageSlug: slug,
          method,
          reference: reference.trim() || null,
          note: note.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "failed")
      setOk(true)
      setMsg(data.message || (isRtl ? "تم إرسال الطلب" : "Submitted"))
    } catch (e: any) {
      setMsg(e.message || "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <Link
          href={`/${locale}/dashboard/packages`}
          className="text-sm text-emerald-700 hover:underline"
        >
          ← {isRtl ? "رجوع للباقات" : "Back to packages"}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {isRtl ? "دفع الباقة يدويًا" : "Manual package payment"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRtl
            ? "حوّل المبلغ ثم سجّل رقم العملية — الأدمن يفعّل الباقة بعد التأكيد"
            : "Transfer then submit the reference — admin activates after review"}
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{isRtl ? "الباقة" : "Package"}</span>
          <span className="font-bold">
            {isRtl ? meta.nameAr : meta.nameEn}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{isRtl ? "المبلغ" : "Amount"}</span>
          <span className="text-xl font-bold text-emerald-700">
            {meta.price} {isRtl ? "جنيه" : "EGP"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("instapay")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold ${
            method === "instapay"
              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
              : "hover:bg-gray-50"
          }`}
        >
          <Building2 size={16} />
          {isRtl ? "إنستاباي" : "InstaPay"}
        </button>
        <button
          type="button"
          onClick={() => setMethod("vodafone")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold ${
            method === "vodafone"
              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
              : "hover:bg-gray-50"
          }`}
        >
          <Smartphone size={16} />
          {isRtl ? "فودافون كاش" : "Vodafone Cash"}
        </button>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
        <p className="text-xs text-amber-900">
          {isRtl ? "حوّل إلى" : "Transfer to"}:{" "}
          <strong>{payName}</strong>
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-lg font-bold tracking-wide bg-white rounded-lg px-3 py-2 border">
            {number}
          </code>
          <button
            type="button"
            onClick={copy}
            className="p-2 rounded-lg border bg-white hover:bg-gray-50"
            title="Copy"
          >
            <Copy size={18} />
          </button>
        </div>
        <p className="text-[11px] text-amber-800">
          {isRtl
            ? "بعد التحويل اكتب رقم العملية أو آخر 4 أرقام من الهاتف المحوّل منه"
            : "After transfer, enter the reference or last digits of sender phone"}
        </p>
      </div>

      {!ok ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">
              {isRtl ? "رقم العملية / المرجع" : "Transfer reference"}
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm"
              placeholder={isRtl ? "مثال: 123456 أو 010xxx" : "e.g. 123456"}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">
              {isRtl ? "ملاحظة (اختياري)" : "Note (optional)"}
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy && <Loader2 className="animate-spin" size={18} />}
            {isRtl ? "تأكيد إرسال الطلب للأدمن" : "Submit for admin review"}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center space-y-2">
          <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
          <p className="font-semibold text-emerald-900">
            {isRtl ? "طلبك قيد المراجعة" : "Request pending review"}
          </p>
          <p className="text-sm text-emerald-800">
            {isRtl
              ? "هتتفعّل الباقة بعد ما الأدمن يتأكد من التحويل"
              : "Package activates after admin confirms the transfer"}
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/packages`)}
            className="mt-2 text-sm text-emerald-700 font-medium underline"
          >
            {isRtl ? "العودة للباقات" : "Back to packages"}
          </button>
        </div>
      )}

      {msg && !ok && (
        <p className="text-sm text-center text-gray-600">{msg}</p>
      )}

      {mine.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-semibold">{isRtl ? "طلبات سابقة" : "Previous requests"}</p>
          {mine.slice(0, 5).map((r) => (
            <div key={r.id} className="flex justify-between border-b py-1">
              <span>
                {r.packageSlug} · {r.amount} · {r.method}
              </span>
              <span
                className={
                  r.status === "PAID"
                    ? "text-emerald-600"
                    : r.status === "REJECTED"
                      ? "text-red-600"
                      : "text-amber-600"
                }
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
