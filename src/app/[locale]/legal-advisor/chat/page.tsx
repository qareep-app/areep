"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import { Scale, Send, AlertTriangle } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function LegalAdvisorChatPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"

  const [topic, setTopic] = useState("")
  const [fee, setFee] = useState("")
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [draft, setDraft] = useState("")
  const [warn, setWarn] = useState("")
  const [loading, setLoading] = useState(false)

  const feeNum = Number(fee) || 0
  const platformFee = Math.round(feeNum * 0.05 * 100) / 100
  const eachShare = Math.round(feeNum * 0.025 * 100) / 100

  const start = async () => {
    if (!topic.trim()) {
      setWarn(isRtl ? "اكتب موضوع الاستشارة" : "Enter topic")
      return
    }
    setLoading(true)
    setWarn("")
    try {
      const res = await fetch("/api/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          topic,
          agreedFee: feeNum > 0 ? feeNum : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "failed")
      setConsultationId(data.consultation.id)
      const msgs = Array.isArray(data.consultation.messages)
        ? data.consultation.messages
        : []
      setMessages(msgs)
    } catch (e: any) {
      setWarn(e.message)
    } finally {
      setLoading(false)
    }
  }

  const send = async () => {
    const text = draft.trim()
    if (!text || !consultationId) return
    setLoading(true)
    setWarn("")
    try {
      const res = await fetch("/api/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "message",
          consultationId,
          text,
          asAdvisor: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "failed")
      setMessages(Array.isArray(data.consultation.messages) ? data.consultation.messages : [])
      setDraft("")
    } catch (e: any) {
      setWarn(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="text-emerald-600" />
            <h1 className="text-xl font-bold">{isRtl ? "محادثة مستشار قانوني" : "Legal chat"}</h1>
          </div>
          <Link
            href={`/${locale}/legal-advisor/inbox`}
            className="text-sm text-emerald-600 font-medium"
          >
            {isRtl ? "لوحة المستشار" : "Advisor inbox"}
          </Link>
        </div>

        {!consultationId ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500">{isRtl ? "موضوع الاستشارة *" : "Topic *"}</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={isRtl ? "مثال: مراجعة عقد بيع سيارة" : "e.g. car contract"}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">
                {isRtl ? "أتعاب متفق عليها (جنيه)" : "Agreed fee (EGP)"}
              </label>
              <input
                type="number"
                min={0}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
              {feeNum > 0 && (
                <p className="text-xs text-emerald-700 mt-1">
                  {isRtl
                    ? `عمولة المنصة 5% = ${platformFee} ج → ${eachShare} على المستشير + ${eachShare} على المستشار`
                    : `Platform 5% = ${platformFee} → ${eachShare} each side`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={start}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {isRtl ? "فتح استشارة وربطها بالمستشار" : "Open consultation"}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-900 flex gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              {isRtl
                ? "ممنوع أرقام أو روابط خارجية. المستشار يرد من لوحة المستشار."
                : "No phones/links. Advisor replies from advisor inbox."}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border p-4 h-80 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "client"
                      ? "ms-8 bg-emerald-600 text-white rounded-2xl rounded-es-md px-3 py-2 text-sm"
                      : m.role === "advisor"
                        ? "me-8 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-ee-md px-3 py-2 text-sm"
                        : "text-center text-xs text-gray-500"
                  }
                >
                  {m.text}
                </div>
              ))}
            </div>
            {warn && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{warn}</div>}
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={isRtl ? "اكتب رسالتك..." : "Message..."}
                className="flex-1 h-12 px-4 rounded-xl border bg-white dark:bg-gray-900 text-sm"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading}
                className="h-12 px-4 rounded-xl bg-emerald-600 text-white"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
        {warn && !consultationId && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{warn}</div>
        )}
      </main>
      <Footer locale={locale} />
    </div>
  )
}
