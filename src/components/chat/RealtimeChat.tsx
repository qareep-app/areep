"use client"

import { useEffect, useRef, useState } from "react"
import { Send, AlertTriangle } from "lucide-react"

type Msg = {
  id: string
  content: string
  senderId: string
  createdAt: string
}

interface Props {
  locale: string
  conversationId?: string
  adId?: string
  currentUserId?: string
}

export default function RealtimeChat({
  locale,
  conversationId: initialConv,
  adId,
  currentUserId,
}: Props) {
  const isRtl = locale === "ar"
  const [conversationId, setConversationId] = useState(initialConv || "")
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [online, setOnline] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastSince = useRef<string>("")

  const load = async () => {
    if (!conversationId) return
    const q = lastSince.current
      ? `?conversationId=${conversationId}&since=${encodeURIComponent(lastSince.current)}`
      : `?conversationId=${conversationId}`
    const res = await fetch(`/api/messages${q}`)
    const data = await res.json()
    if (data.messages?.length) {
      setMessages((prev) => {
        const map = new Map(prev.map((m) => [m.id, m]))
        for (const m of data.messages) map.set(m.id, m)
        const arr = Array.from(map.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        if (arr.length) lastSince.current = arr[arr.length - 1].createdAt
        return arr
      })
    }
  }

  useEffect(() => {
    load()
    // Fast poll fallback (2s) — replaced by Pusher when available
    const t = setInterval(load, 2000)

    // Optional Pusher (CDN) when public key exists
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu"
    if (key && conversationId && typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "https://js.pusher.com/8.4.0/pusher.min.js"
      script.async = true
      script.onload = () => {
        try {
          // @ts-ignore
          const Pusher = window.Pusher
          const pusher = new Pusher(key, { cluster })
          const ch = pusher.subscribe(`conversation-${conversationId}`)
          ch.bind("new-message", (data: Msg) => {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.id)) return prev
              return [...prev, data]
            })
            setOnline(true)
          })
          setOnline(true)
        } catch {
          setOnline(false)
        }
      }
      document.body.appendChild(script)
    }

    return () => clearInterval(t)
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    setError("")
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversationId || undefined, adId, text }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "error")
      return
    }
    if (data.conversationId && !conversationId) setConversationId(data.conversationId)
    if (data.message) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
      )
    }
    setDraft("")
  }

  return (
    <div className="flex flex-col h-[420px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="px-4 py-2 border-b text-xs text-gray-500 flex justify-between">
        <span>{isRtl ? "شات قريب (داخلي فقط)" : "Areep chat (in-app only)"}</span>
        <span className={online ? "text-emerald-600" : "text-gray-400"}>
          {online ? (isRtl ? "مباشر ●" : "Live ●") : isRtl ? "تحديث سريع" : "Fast sync"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => {
          const mine = currentUserId && m.senderId === currentUserId
          return (
            <div
              key={m.id}
              className={
                mine
                  ? "ms-10 bg-emerald-600 text-white rounded-2xl rounded-es-md px-3 py-2 text-sm"
                  : "me-10 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-ee-md px-3 py-2 text-sm"
              }
            >
              {m.content}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {error && (
        <div className="px-3 text-xs text-red-600 flex gap-1 items-center">
          <AlertTriangle size={12} />
          {error}
        </div>
      )}
      <div className="p-2 flex gap-2 border-t">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={isRtl ? "اكتب رسالة..." : "Type a message..."}
          className="flex-1 h-11 px-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800"
        />
        <button
          type="button"
          onClick={send}
          className="h-11 px-4 rounded-xl bg-emerald-600 text-white"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
