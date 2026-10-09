"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle, Loader2 } from "lucide-react"

export default function ConversationsList({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/chat/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.conversations || d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b font-semibold flex items-center gap-2">
        <MessageCircle size={18} className="text-emerald-600" />
        {isRtl ? "الرسائل" : "Messages"}
      </div>
      {loading && (
        <div className="p-10 text-center text-sm text-gray-500 flex justify-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          {isRtl ? "جاري التحميل..." : "Loading..."}
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="p-10 text-center text-sm text-gray-500">
          {isRtl ? "مفيش محادثات لسه. ابدأ محادثة من صفحة إعلان." : "No conversations yet. Start from an ad page."}
        </div>
      )}
      {!loading &&
        items.map((c) => (
          <Link
            key={c.id}
            href={`/${locale}/messages/${c.id}`}
            className="block px-5 py-4 border-t hover:bg-gray-50"
          >
            <div className="font-medium text-gray-900">
              {c.peerName || c.title || (isRtl ? "محادثة" : "Chat")}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">
              {c.lastMessage || ""}
            </div>
          </Link>
        ))}
    </div>
  )
}
