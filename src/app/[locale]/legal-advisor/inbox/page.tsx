"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import { Scale, Send } from "lucide-react"
import { useParams } from "next/navigation"

type Consultation = {
  id: string
  topic: string
  status: string
  agreedFee: any
  platformFee: any
  clientShare: any
  advisorShare: any
  messages: { role: string; text: string; at?: string }[]
}

export default function AdvisorInboxPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"

  const [list, setList] = useState<Consultation[]>([])
  const [active, setActive] = useState<Consultation | null>(null)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [advisorName, setAdvisorName] = useState("")

  const load = async () => {
    const res = await fetch("/api/legal?role=advisor")
    const data = await res.json()
    if (data.ok) {
      setList(data.consultations || [])
      setAdvisorName(data.advisor?.name || "")
      if (active) {
        const fresh = (data.consultations || []).find((c: Consultation) => c.id === active.id)
        if (fresh) setActive(fresh)
      }
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [])

  const reply = async () => {
    if (!active || !draft.trim()) return
    setError("")
    const res = await fetch("/api/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "message",
        consultationId: active.id,
        text: draft.trim(),
        asAdvisor: true,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "error")
      return
    }
    setActive(data.consultation)
    setDraft("")
    load()
  }

  const complete = async () => {
    if (!active) return
    await fetch("/api/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", consultationId: active.id }),
    })
    load()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold">{isRtl ? "لوحة المستشار القانوني" : "Advisor inbox"}</h1>
            <p className="text-xs text-gray-500">
              {isRtl ? "الحساب: " : "Account: "}
              {advisorName || (isRtl ? "مستشار قريب" : "Areep advisor")}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-3 space-y-2 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-gray-500 px-1">
              {isRtl ? "طلبات الاستشارة" : "Consultations"} ({list.length})
            </p>
            {list.length === 0 && (
              <p className="text-sm text-gray-400 p-2">{isRtl ? "لا توجد طلبات بعد" : "No requests yet"}</p>
            )}
            {list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c)}
                className={`w-full text-start p-3 rounded-xl border text-sm transition ${
                  active?.id === c.id
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="font-medium line-clamp-2">{c.topic}</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {c.status}
                  {c.agreedFee != null && ` · ${Number(c.agreedFee)} ج`}
                  {c.platformFee != null && ` · عمولة ${Number(c.platformFee)}`}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-4 min-h-[50vh] flex flex-col">
            {!active ? (
              <p className="text-gray-400 text-sm m-auto">
                {isRtl ? "اختَر استشارة للرد عليها" : "Select a consultation"}
              </p>
            ) : (
              <>
                <div className="border-b pb-3 mb-3">
                  <h2 className="font-bold">{active.topic}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRtl ? "الحالة: " : "Status: "}
                    {active.status}
                    {active.agreedFee != null && (
                      <>
                        {" · "}
                        {isRtl ? "أتعاب " : "Fee "}
                        {Number(active.agreedFee)} {isRtl ? "ج · عمولة الموقع " : "EGP · platform "}
                        {Number(active.platformFee)} (
                        {isRtl ? "2.5% لكل طرف" : "2.5% each"})
                      </>
                    )}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[45vh]">
                  {(Array.isArray(active.messages) ? active.messages : []).map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "advisor"
                          ? "ms-10 bg-emerald-600 text-white rounded-2xl px-3 py-2 text-sm"
                          : m.role === "client"
                            ? "me-10 bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 text-sm"
                            : "text-center text-xs text-gray-500"
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && reply()}
                    placeholder={isRtl ? "رد المستشار..." : "Advisor reply..."}
                    className="flex-1 h-11 px-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={reply}
                    className="h-11 px-4 rounded-xl bg-emerald-600 text-white"
                  >
                    <Send size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={complete}
                    className="h-11 px-3 rounded-xl border text-xs font-medium"
                  >
                    {isRtl ? "إنهاء" : "Done"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
