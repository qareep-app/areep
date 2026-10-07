import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { publishRealtime } from "@/lib/realtime"

const db = prisma as any

const BLOCKED =
  /(\+?\d[\d\s\-()]{7,}\d)|(https?:\/\/\S+)|(واتس|واتساب|whatsapp|تيليجرام|telegram)/i

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")

    let userId = session?.id
    if (!userId) {
      const u = await db.user.findFirst({ where: { phone: "01000000000" } })
      userId = u?.id
    }

    if (!conversationId) {
      if (!userId) return NextResponse.json({ conversations: [] })
      const conversations = await db.conversation.findMany({
        where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        include: {
          ad: { select: { id: true, titleAr: true, images: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { lastMessageAt: "desc" },
        take: 40,
      })
      return NextResponse.json({ conversations })
    }

    const since = searchParams.get("since")
    const messages = await db.message.findMany({
      where: {
        conversationId,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    })
    return NextResponse.json({ messages })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()
    const { conversationId, adId, text } = body

    if (!text || BLOCKED.test(String(text))) {
      return NextResponse.json(
        { error: "الرسالة مرفوضة — ممنوع أرقام أو روابط خارجية" },
        { status: 400 }
      )
    }

    let userId = session?.id
    if (!userId) {
      const u = await db.user.upsert({
        where: { phone: "01000000000" },
        update: {},
        create: { phone: "01000000000", name: "مستخدم تجريبي", role: "USER" },
      })
      userId = u.id
    }

    let convId = conversationId
    let receiverId: string | null = null

    if (!convId) {
      if (!adId) {
        return NextResponse.json({ error: "adId required" }, { status: 400 })
      }
      const ad = await db.ad.findUnique({ where: { id: adId } })
      if (!ad) return NextResponse.json({ error: "ad not found" }, { status: 404 })
      receiverId = ad.userId

      const existing = await db.conversation.findFirst({
        where: { adId, buyerId: userId },
      })
      if (existing) {
        convId = existing.id
        receiverId = existing.sellerId === userId ? existing.buyerId : existing.sellerId
      } else {
        const created = await db.conversation.create({
          data: {
            adId,
            buyerId: userId,
            sellerId: ad.userId,
          },
        })
        convId = created.id
      }
    } else {
      const conv = await db.conversation.findUnique({ where: { id: convId } })
      if (!conv) return NextResponse.json({ error: "conversation not found" }, { status: 404 })
      receiverId = conv.buyerId === userId ? conv.sellerId : conv.buyerId
    }

    const msg = await db.message.create({
      data: {
        conversationId: convId,
        senderId: userId,
        receiverId,
        content: String(text).trim(),
      },
    })

    await db.conversation.update({
      where: { id: convId },
      data: { lastMessageAt: new Date() },
    })

    await publishRealtime(`conversation-${convId}`, "new-message", msg)

    return NextResponse.json({ ok: true, message: msg, conversationId: convId })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
