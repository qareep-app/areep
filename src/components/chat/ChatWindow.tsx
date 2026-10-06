"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Send, Shield, MoreVertical } from "lucide-react"

interface ChatWindowProps {
  locale: string
  conversationId: string
}

// Mock messages
const mockMessages = [
  {
    id: "1",
    senderId: "other",
    content: "السلام عليكم، العربية لسه متاحة؟",
    contentEn: "Hello, is the car still available?",
    time: "10:30",
  },
  {
    id: "2",
    senderId: "me",
    content: "وعليكم السلام، أيوه متاحة. تحب تشوفها؟",
    contentEn: "Hello, yes it's available. Would you like to see it?",
    time: "10:32",
  },
  {
    id: "3",
    senderId: "other",
    content: "أيوه لو ممكن. فين مكانها؟",
    contentEn: "Yes please. Where is it located?",
    time: "10:33",
  },
  {
    id: "4",
    senderId: "me",
    content: "في مدينة نصر. نقدر نستخدم نظام وسيط قريب لو حابب أمان أكتر.",
    contentEn: "In Nasr City. We can use Areep Escrow if you want more safety.",
    time: "10:35",
  },
]

export default function ChatWindow({ locale, conversationId }: ChatWindowProps) {
  const isRtl = locale === "ar"
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderId: "me",
        content: message,
        contentEn: message,
        time: new Date().toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-EG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ])
    setMessage("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full bg-white border-x border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <Link
          href={`/${locale}/messages`}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </Link>

        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
          أ
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">أحمد م.</div>
          <div className="text-xs text-gray-500 truncate">
            {isRtl ? "بخصوص: تويوتا كورولا 2020" : "About: Toyota Corolla 2020"}
          </div>
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Safety banner */}
      <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
        <Shield size={14} className="shrink-0" />
        <span>
          {isRtl
            ? "التواصل داخل قريب فقط – مفيش أرقام تليفون بتظهر"
            : "Chat only inside Areep – no phone numbers are shown"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === "me"
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "bg-emerald-600 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">
                  {isRtl ? msg.content : msg.contentEn}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMe ? "text-emerald-100" : "text-gray-400"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isRtl ? "اكتب رسالتك..." : "Type your message..."}
            className="flex-1 h-12 px-4 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white flex items-center justify-center transition shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          {isRtl
            ? "لا تشارك رقم تليفونك أو أي بيانات شخصية خارج الشات"
            : "Do not share your phone number or personal data outside the chat"}
        </p>
      </div>
    </div>
  )
}
