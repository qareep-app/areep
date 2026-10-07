"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"
import RealtimeChat from "@/components/chat/RealtimeChat"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { useParams } from "next/navigation"

export default function MessagesPage() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"
  const [conversations, setConversations] = useState<any[]>([])
  const [active, setActive] = useState<string>("")
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.id) setUserId(d.user.id)
      })
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{isRtl ? "الرسائل" : "Messages"}</h1>
        <div className="grid md:grid-cols-[260px_1fr] gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-3 space-y-2 max-h-[70vh] overflow-y-auto">
            {conversations.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">
                <MessageCircle className="mx-auto mb-2 opacity-40" />
                {isRtl ? "مفيش محادثات — ابدأ من صفحة إعلان" : "No chats yet"}
                <div className="mt-3">
                  <Link href={`/${locale}/ads`} className="text-emerald-600 text-xs">
                    {isRtl ? "تصفح الإعلانات" : "Browse ads"}
                  </Link>
                </div>
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c.id)}
                className={`w-full text-start p-3 rounded-xl border text-sm ${
                  active === c.id
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium truncate">{c.ad?.titleAr || "محادثة"}</div>
                <div className="text-[11px] text-gray-400 truncate mt-1">
                  {c.messages?.[0]?.content || ""}
                </div>
              </button>
            ))}
          </div>
          <div>
            {active ? (
              <RealtimeChat locale={locale} conversationId={active} currentUserId={userId} />
            ) : (
              <div className="h-[420px] flex items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border text-gray-400 text-sm">
                {isRtl ? "اختَر محادثة" : "Select a conversation"}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}
