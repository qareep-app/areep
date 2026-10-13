"use client"

import { useEffect, useState } from "react"
import RealtimeChat from "@/components/chat/RealtimeChat"
import Link from "next/link"
import { MessageCircle, ArrowRight, Loader2 } from "lucide-react"
import { useParams, useSearchParams, useRouter } from "next/navigation"

export default function MessagesClient() {
  const params = useParams()
  const locale = (params?.locale as string) || "ar"
  const isRtl = locale === "ar"
  const searchParams = useSearchParams()
  const router = useRouter()
  const adFromUrl = searchParams.get("ad") || ""

  const [conversations, setConversations] = useState<any[]>([])
  const [active, setActive] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [adInfo, setAdInfo] = useState<any>(null)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [bootError, setBootError] = useState("")

  const loadConversations = () =>
    fetch("/api/messages", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.conversations || [])
        if (d.userId) setUserId(d.userId)
        return d.conversations || []
      })
      .catch(() => [])

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.id) {
          setUserId(d.user.id)
          setLoggedIn(true)
        } else {
          setLoggedIn(false)
        }
      })
      .catch(() => setLoggedIn(false))

    loadConversations()
  }, [])

  useEffect(() => {
    if (!adFromUrl) {
      setAdInfo(null)
      return
    }
    fetch(`/api/ads/${adFromUrl}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.ad) setAdInfo(d.ad)
      })
      .catch(() => {})
  }, [adFromUrl])

  useEffect(() => {
    if (!adFromUrl || !conversations.length) return
    const found = conversations.find(
      (c: any) => c.adId === adFromUrl || c.ad?.id === adFromUrl
    )
    if (found) setActive(found.id)
  }, [adFromUrl, conversations])

  const startChatForAd = async () => {
    if (!adFromUrl) return
    if (!loggedIn) {
      router.push(
        `/${locale}/auth?next=${encodeURIComponent(`/${locale}/messages?ad=${adFromUrl}`)}`
      )
      return
    }
    setBootstrapping(true)
    setBootError("")
    try {
      const starter = isRtl
        ? "مرحباً، مهتم بالإعلان"
        : "Hi, I'm interested in this ad"
      const res = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: adFromUrl, text: starter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل بدء المحادثة")
      const convId = data.conversationId as string | undefined
      const list = await loadConversations()
      if (convId) setActive(convId)
      else if (list?.length) {
        const found = list.find(
          (c: any) => c.adId === adFromUrl || c.ad?.id === adFromUrl
        )
        if (found) setActive(found.id)
      }
    } catch (e: any) {
      setBootError(e.message)
    } finally {
      setBootstrapping(false)
    }
  }

  if (loggedIn === false) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center space-y-3">
        <MessageCircle className="mx-auto text-gray-300" size={40} />
        <p className="text-gray-600">
          {isRtl ? "سجّل دخول عشان تتواصل مع البائعين" : "Log in to chat with sellers"}
        </p>
        <Link
          href={`/${locale}/auth?next=${encodeURIComponent(
            `/${locale}/messages${adFromUrl ? `?ad=${adFromUrl}` : ""}`
          )}`}
          className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold"
        >
          {isRtl ? "تسجيل الدخول" : "Log in"}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border p-3 space-y-2 max-h-[70vh] overflow-y-auto">
        {conversations.length === 0 && !adFromUrl && (
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
        {conversations.map((c: any) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`w-full text-start rounded-xl px-3 py-2.5 text-sm transition ${
              active === c.id ? "bg-emerald-50 text-emerald-900" : "hover:bg-gray-50"
            }`}
          >
            <div className="font-medium truncate">{c.ad?.titleAr || "—"}</div>
            <div className="text-xs text-gray-400 truncate mt-0.5">
              {c.messages?.[0]?.content || (isRtl ? "بدون رسائل" : "No messages")}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {adFromUrl && !active && (
          <div className="bg-white border rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              {adInfo?.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={adInfo.images[0]}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900">
                  {adInfo?.titleAr || (isRtl ? "محادثة حول الإعلان" : "Chat about ad")}
                </h2>
                {adInfo?.price != null && (
                  <p className="text-emerald-700 font-bold text-sm mt-0.5">
                    {Number(adInfo.price).toLocaleString()}{" "}
                    {isRtl ? "جنيه" : "EGP"}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {isRtl
                    ? "التواصل داخل قريب فقط — ممنوع أرقام أو روابط"
                    : "In-app chat only — no phone numbers or links"}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={bootstrapping || loggedIn === null}
              onClick={startChatForAd}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
            >
              {bootstrapping ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <MessageCircle size={18} />
              )}
              {isRtl ? "ابدأ المحادثة مع البائع" : "Start chat with seller"}
            </button>
            {bootError && <p className="text-sm text-red-600">{bootError}</p>}
            {adInfo && (
              <Link
                href={`/${locale}/ads/${adFromUrl}`}
                className="inline-flex items-center gap-1 text-sm text-emerald-700"
              >
                {isRtl ? "رجوع للإعلان" : "Back to ad"}
                <ArrowRight size={14} className={isRtl ? "rotate-180" : ""} />
              </Link>
            )}
          </div>
        )}

        {active ? (
          <RealtimeChat locale={locale} conversationId={active} currentUserId={userId} />
        ) : (
          !adFromUrl && (
            <div className="bg-white rounded-2xl border p-10 text-center text-sm text-gray-400">
              {isRtl ? "اختر محادثة من القائمة" : "Select a conversation"}
            </div>
          )
        )}
      </div>
    </div>
  )
}
