"use client"

import { useMemo, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import { Scale, Send, AlertTriangle } from "lucide-react"
import { useParams } from "next/navigation"

const BLOCKED =
  /(\+?\d[\d\s\-()]{7,}\d)|(https?:\/\/\S+)|(@\w+\.(com|net|org))|(واتس|واتساب|whatsapp|تيليجرام|telegram|انستا|instagram)/i

export default function LegalAdvisorChatPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"

  const [topic, setTopic] = useState("")
  const [fee, setFee] = useState("")
  const [messages, setMessages] = useState<
    { role: "user" | "system" | "advisor"; text: string }[]
  >([
    {
      role: "system",
      text: isRtl
        ? "مرحباً — اكتب موضوع الاستشارة. ممنوع أرقام التليفون أو الروابط أو وسائل تواصل خارجية. عمولة المنصة 5% (2.5% + 2.5%)."
        : "Describe your case. No phone numbers or external links. Platform fee 5% (2.5%+2.5%).",
    },
  ])
  const [draft, setDraft] = useState("")
  const [warn, setWarn] = useState("")

  const feeNum = Number(fee) || 0
  const platformFee = useMemo(() => Math.round(feeNum * 0.05 * 100) / 100, [feeNum])
  const eachShare = useMemo(() => Math.round(feeNum * 0.025 * 100) / 100, [feeNum])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    if (BLOCKED.test(text)) {
      setWarn(
        isRtl
          ? "الرسالة فيها رقم أو رابط أو وسيلة تواصل خارجية — ممنوع حسب ضوابط الموقع."
          : "Message contains phone/link/external contact — not allowed."
      )
      return
    }
    setWarn("")
    setMessages((m) => [...m, { role: "user", text }])
    setDraft("")
    // Simulated advisor ack (until real chat backend)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "advisor",
          text: isRtl
            ? "تم استلام رسالتك. مستشار معتمد سيراجعها قريباً عبر المنصة فقط."
            : "Received. A certified advisor will reply inside the platform.",
        },
      ])
    }, 600)
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="text-emerald-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {isRtl ? "محادثة مستشار قانوني" : "Legal advisor chat"}
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500">{isRtl ? "موضوع الاستشارة" : "Topic"}</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={isRtl ? "مثال: مراجعة عقد بيع سيارة" : "e.g. car sale contract review"}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">
              {isRtl ? "أتعاب متفق عليها (جنيه) — اختياري الآن" : "Agreed fee (EGP) — optional"}
            </label>
            <input
              type="number"
              min={0}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
            />
            {feeNum > 0 && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                {isRtl
                  ? `عمولة المنصة 5% = ${platformFee} ج (2.5% = ${eachShare} على كل طرف)`
                  : `Platform 5% = ${platformFee} EGP (${eachShare} each side)`}
              </p>
            )}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-xl px-3 py-2 text-xs text-amber-900 dark:text-amber-200 flex gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          {isRtl
            ? "ممنوع تبادل أرقام أو عناوين أو روابط خارج الشات. المخالفة قد توقف الحساب."
            : "No phones, addresses, or external links. Violations may suspend accounts."}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 h-80 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ms-8 bg-emerald-600 text-white rounded-2xl rounded-es-md px-3 py-2 text-sm"
                  : m.role === "advisor"
                    ? "me-8 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-ee-md px-3 py-2 text-sm"
                    : "text-center text-xs text-gray-500 px-2"
              }
            >
              {m.text}
            </div>
          ))}
        </div>

        {warn && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl px-3 py-2">
            {warn}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={isRtl ? "اكتب رسالتك..." : "Type a message..."}
            className="flex-1 h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm"
          />
          <button
            type="button"
            onClick={send}
            className="h-12 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Send size={18} />
          </button>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
