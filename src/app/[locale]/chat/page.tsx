import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** /chat → /messages (توافق مع الروابط القديمة) */
export default async function ChatRedirectPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const ad = typeof sp.ad === "string" ? sp.ad : ""
  const q = ad ? `?ad=${encodeURIComponent(ad)}` : ""
  redirect(`/${locale}/messages${q}`)
}
