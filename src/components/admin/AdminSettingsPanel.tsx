"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"

export default function AdminSettingsPanel({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [health, setHealth] = useState<any>(null)
  const [paymob, setPaymob] = useState<any>(null)
  const [presence, setPresence] = useState<any>(null)

  const load = () => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => {})
    fetch("/api/paymob/status").then((r) => r.json()).then(setPaymob).catch(() => {})
    fetch("/api/presence").then((r) => r.json()).then(setPresence).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  const Row = ({ ok, label, value }: { ok?: boolean; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      {ok === true ? (
        <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
      ) : ok === false ? (
        <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
      ) : (
        <span className="w-[18px]" />
      )}
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5 break-all">{value}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border rounded-lg"
        >
          <RefreshCw size={14} /> {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-5">
        <h2 className="font-semibold mb-2">{isRtl ? "حالة النظام" : "System status"}</h2>
        <Row
          ok={health?.ok === true || health?.database === "connected"}
          label={isRtl ? "قاعدة البيانات" : "Database"}
          value={
            health
              ? JSON.stringify(health.stats || health)
              : isRtl
                ? "جاري الفحص..."
                : "Checking..."
          }
        />
        <Row
          ok={paymob?.configured === true}
          label="Paymob"
          value={
            paymob
              ? `configured=${paymob.configured} · iframe=${paymob.iframeId || "—"} · appUrl=${paymob.appUrl || "—"}`
              : "…"
          }
        />
        <Row
          ok={presence?.upstash === true}
          label={isRtl ? "عداد الزوار (Upstash)" : "Visitor counter (Upstash)"}
          value={
            presence
              ? presence.upstash
                ? `online≈${presence.visitorsOnline ?? presence.onlineUsers}`
                : isRtl
                  ? "غير مفعّل — أضف UPSTASH_REDIS_REST_URL على Vercel"
                  : "Not set — add UPSTASH env on Vercel"
              : "…"
          }
        />
      </div>

      <div className="bg-white rounded-2xl border p-5 text-sm space-y-3">
        <h2 className="font-semibold">{isRtl ? "قواعد العمولة (ثابتة في الكود حالياً)" : "Commission rules (code defaults)"}</h2>
        <ul className="list-disc ms-5 text-gray-600 space-y-1">
          <li>{isRtl ? "عام: 2% على البيعة من البائع" : "Default: 2% from seller"}</li>
          <li>
            {isRtl
              ? "سيارات / قطع غيار + وسيط: 2.5% بائع + 2.5% مشتري"
              : "Cars/parts + escrow: 2.5% seller + 2.5% buyer"}
          </li>
          <li>
            {isRtl
              ? "عقارات إيجار: نصف شهر من كل طرف · تمليك + وسيط: 2.5%+2.5%"
              : "Rent: half month each · Sale+escrow: 2.5%+2.5%"}
          </li>
        </ul>
        <p className="text-xs text-gray-400">
          {isRtl
            ? "تعديل النسب من لوحة مرئية يمكن إضافته لاحقاً؛ حالياً مضبوطة في منطق العمولات."
            : "Editable rates UI can be added later; currently enforced in commission logic."}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-900">
        {isRtl
          ? "أرقام الأدمن تُدار من متغير ADMIN_PHONES على Vercel فقط (لا تظهر هنا لأسباب أمنية)."
          : "Admin phones are managed only via ADMIN_PHONES on Vercel (hidden here for security)."}
      </div>
    </div>
  )
}
