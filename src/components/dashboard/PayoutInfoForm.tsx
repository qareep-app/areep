"use client"

import { useEffect, useState } from "react"
import { Landmark, Loader2, Save, Wallet } from "lucide-react"

export default function PayoutInfoForm({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [form, setForm] = useState({
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIban: "",
    walletType: "",
    walletNumber: "",
  })

  useEffect(() => {
    fetch("/api/me/payout-info", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.payout) {
          setForm({
            bankName: d.payout.bankName || "",
            bankAccountName: d.payout.bankAccountName || "",
            bankAccountNumber: d.payout.bankAccountNumber || "",
            bankIban: d.payout.bankIban || "",
            walletType: d.payout.walletType || "",
            walletNumber: d.payout.walletNumber || "",
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    setMsg("")
    try {
      const r = await fetch("/api/me/payout-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "fail")
      setMsg(isRtl ? "تم حفظ بيانات الاستلام" : "Payout details saved")
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-5 text-gray-400 text-sm flex items-center gap-2">
        <Loader2 className="animate-spin" size={16} /> ...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-4">
      <h2 className="font-semibold flex items-center gap-2">
        <Landmark size={18} className="text-emerald-600" />
        {isRtl ? "بيانات استلام المستحقات (وسيط قريب)" : "Payout details (Escrow)"}
      </h2>
      <p className="text-xs text-gray-500">
        {isRtl
          ? "بعد اكتمال صفقة الوسيط، الأدمن يحوّل صافي مستحقاتك على الحساب أو المحفظة المسجّلة هنا. Paymob يحصّل من المشتري لحساب المنصة فقط."
          : "After an escrow deal completes, admin transfers your net amount to this bank/wallet. Paymob collects from the buyer to the platform only."}
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm space-y-1">
          <span className="text-gray-600">{isRtl ? "اسم البنك" : "Bank name"}</span>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={form.bankName}
            onChange={(e) => set("bankName", e.target.value)}
            placeholder={isRtl ? "مثال: البنك الأهلي" : "e.g. NBE"}
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-gray-600">{isRtl ? "اسم صاحب الحساب" : "Account holder"}</span>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={form.bankAccountName}
            onChange={(e) => set("bankAccountName", e.target.value)}
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-gray-600">{isRtl ? "رقم الحساب" : "Account number"}</span>
          <input
            className="w-full border rounded-xl px-3 py-2 font-mono"
            dir="ltr"
            value={form.bankAccountNumber}
            onChange={(e) => set("bankAccountNumber", e.target.value)}
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-gray-600">IBAN {isRtl ? "(اختياري)" : "(optional)"}</span>
          <input
            className="w-full border rounded-xl px-3 py-2 font-mono"
            dir="ltr"
            value={form.bankIban}
            onChange={(e) => set("bankIban", e.target.value)}
          />
        </label>
      </div>

      <div className="border-t pt-4 grid sm:grid-cols-2 gap-3">
        <label className="text-sm space-y-1">
          <span className="text-gray-600 flex items-center gap-1">
            <Wallet size={14} />
            {isRtl ? "نوع المحفظة" : "Wallet type"}
          </span>
          <select
            className="w-full border rounded-xl px-3 py-2"
            value={form.walletType}
            onChange={(e) => set("walletType", e.target.value)}
          >
            <option value="">{isRtl ? "— لا يوجد —" : "— None —"}</option>
            <option value="vodafone">Vodafone Cash</option>
            <option value="instapay">InstaPay</option>
            <option value="etisalat">Etisalat Cash</option>
            <option value="orange">Orange Cash</option>
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-gray-600">{isRtl ? "رقم المحفظة" : "Wallet number"}</span>
          <input
            className="w-full border rounded-xl px-3 py-2 font-mono"
            dir="ltr"
            value={form.walletNumber}
            onChange={(e) => set("walletNumber", e.target.value)}
            placeholder="01xxxxxxxxx"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        {isRtl ? "حفظ بيانات الاستلام" : "Save payout details"}
      </button>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
    </div>
  )
}
