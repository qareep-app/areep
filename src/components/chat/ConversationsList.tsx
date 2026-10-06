"use client"

import Link from "next/link"
import { MessageCircle, Search } from "lucide-react"

interface ConversationsListProps {
  locale: string
}

// Mock data for UI (will be replaced by API later)
const mockConversations = [
  {
    id: "1",
    adTitle: "تويوتا كورولا 2020",
    adTitleEn: "Toyota Corolla 2020",
    otherUserName: "أحمد م.",
    lastMessage: "السيارة لسه متاحة؟",
    lastMessageEn: "Is the car still available?",
    time: "منذ 10 دقائق",
    timeEn: "10 min ago",
    unread: 2,
    adImage: null,
  },
  {
    id: "2",
    adTitle: "شقة للبيع - مدينة نصر",
    adTitleEn: "Apartment for sale - Nasr City",
    otherUserName: "سارة ع.",
    lastMessage: "ممكن نتقابل بكرة؟",
    lastMessageEn: "Can we meet tomorrow?",
    time: "منذ ساعة",
    timeEn: "1 hour ago",
    unread: 0,
    adImage: null,
  },
  {
    id: "3",
    adTitle: "آيفون 14 برو",
    adTitleEn: "iPhone 14 Pro",
    otherUserName: "محمود ك.",
    lastMessage: "تمام، هحول العربون",
    lastMessageEn: "Okay, I'll transfer the deposit",
    time: "أمس",
    timeEn: "Yesterday",
    unread: 0,
    adImage: null,
  },
]

export default function ConversationsList({ locale }: ConversationsListProps) {
  const isRtl = locale === "ar"

  if (mockConversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {isRtl ? "مفيش رسائل لسه" : "No messages yet"}
        </h3>
        <p className="text-sm text-gray-500">
          {isRtl
            ? "لما حد يتواصل معاك هتظهر المحادثات هنا"
            : "When someone contacts you, conversations will appear here"}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 text-gray-400" size={18} style={isRtl ? { right: 12 } : { left: 12 }} />
          <input
            type="text"
            placeholder={isRtl ? "ابحث في المحادثات..." : "Search conversations..."}
            className={`w-full h-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none text-sm ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"}`}
          />
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {mockConversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/${locale}/messages/${conv.id}`}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
              {conv.otherUserName.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-semibold text-gray-900 truncate">
                  {conv.otherUserName}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {isRtl ? conv.time : conv.timeEn}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate mb-0.5">
                {isRtl ? conv.adTitle : conv.adTitleEn}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {isRtl ? conv.lastMessage : conv.lastMessageEn}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {conv.unread}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Privacy note */}
      <div className="p-4 bg-emerald-50 border-t border-emerald-100">
        <p className="text-xs text-emerald-800 text-center">
          {isRtl
            ? "🔒 التواصل داخل قريب فقط – مفيش أرقام تليفون بتظهر للحفاظ على خصوصيتك"
            : "🔒 Chat only inside Areep – no phone numbers are shown to protect your privacy"}
        </p>
      </div>
    </div>
  )
}
