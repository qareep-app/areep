"use client"

import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Suspense, useEffect, useState } from "react"

function ResultBody() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"
  const sp = useSearchParams()
  const success =
    sp.get("success") === "true" ||
    sp.get("payment") === "ok" ||
    sp.get("data.message") === "APPROVED"
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "err">("idle")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    if (!success) return
    setStatus("loading")
    fetch("/api/packages/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || "failed")
        setMsg(
          isRtl
            ? `تم تفعيل باقة ${d.packageSlug || ""}`
            : `Package ${d.packageSlug || ""} activated`
        )
        setStatus("done")
      })
      .catch((e) => {
        setMsg(e.message)
        setStatus("err")
      })
  }, [success, isRtl])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center space-y-4">
          {success ? (
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
          ) : (
            <XCircle className="mx-auto text-red-500" size={48} />
          )}
          <h1 className="text-xl font-bold">
            {success
              ? isRtl
                ? "تم الدفع بنجاح"
                : "Payment successful"
              : isRtl
                ? "لم يكتمل الدفع"
                : "Payment not completed"}
          </h1>
          {status === "loading" && (
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              {isRtl ? "جاري تفعيل الباقة..." : "Activating package..."}
            </p>
          )}
          {msg && (
            <p className={`text-sm ${status === "err" ? "text-amber-700" : "text-emerald-700"}`}>
              {msg}
            </p>
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href={`/${locale}/dashboard/packages`}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
            >
              {isRtl ? "الباقات" : "Packages"}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="px-4 py-2.5 rounded-xl border text-sm"
            >
              {isRtl ? "لوحة الحساب" : "Dashboard"}
            </Link>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">...</div>}>
      <ResultBody />
    </Suspense>
  )
}
