import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import ChatWindow from "@/components/chat/ChatWindow"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function ConversationPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <main className="flex-1 flex flex-col">
        <ChatWindow locale={locale} conversationId={id} />
      </main>
    </div>
  )
}
