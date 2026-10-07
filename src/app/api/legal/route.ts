import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const BLOCKED =
  /(\+?\d[\d\s\-()]{7,}\d)|(https?:\/\/\S+)|(@\w+\.(com|net|org))|(واتس|واتساب|whatsapp|تيليجرام|telegram)/i

/** GET list consultations — ?role=advisor|client */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") || "client"
    const userId = searchParams.get("userId")

    // Dev: resolve demo users
    let advisor = await prisma.user.findFirst({
      where: { role: "LEGAL_CONSULTANT" },
    })
    if (!advisor) {
      advisor = await prisma.user.create({
        data: {
          phone: "01110000000",
          name: "مستشار قريب القانوني",
          role: "LEGAL_CONSULTANT",
          isVerified: true,
          trustBadge: "VERIFIED_LEGAL",
        },
      })
    }

    let client = await prisma.user.findFirst({ where: { phone: "01000000000" } })
    if (!client) {
      client = await prisma.user.upsert({
        where: { phone: "01000000000" },
        update: {},
        create: { phone: "01000000000", name: "مستخدم تجريبي", role: "USER" },
      })
    }

    const where =
      role === "advisor"
        ? {
            OR: [
              { advisorId: advisor.id },
              { advisorId: null, status: "OPEN" },
            ],
          }
        : { clientId: userId || client.id }

    const list = await prisma.legalConsultation.findMany({
      where: where as any,
      orderBy: { updatedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      ok: true,
      advisor: { id: advisor.id, name: advisor.name },
      client: { id: client.id, name: client.name },
      consultations: list,
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 })
  }
}

/** POST create consultation or append message */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    // Ensure advisor exists
    let advisor = await prisma.user.findFirst({ where: { role: "LEGAL_CONSULTANT" } })
    if (!advisor) {
      advisor = await prisma.user.create({
        data: {
          phone: "01110000000",
          name: "مستشار قريب القانوني",
          role: "LEGAL_CONSULTANT",
          isVerified: true,
          trustBadge: "VERIFIED_LEGAL",
        },
      })
    }

    let client = await prisma.user.findFirst({ where: { phone: "01000000000" } })
    if (!client) {
      client = await prisma.user.upsert({
        where: { phone: "01000000000" },
        update: {},
        create: { phone: "01000000000", name: "مستخدم تجريبي", role: "USER" },
      })
    }

    if (action === "create") {
      const topic = String(body.topic || "").trim()
      const agreedFee = body.agreedFee != null ? Number(body.agreedFee) : null
      if (!topic) {
        return NextResponse.json({ error: "topic required" }, { status: 400 })
      }
      const platformFee = agreedFee != null ? Math.round(agreedFee * 0.05 * 100) / 100 : null
      const share = agreedFee != null ? Math.round(agreedFee * 0.025 * 100) / 100 : null

      const row = await prisma.legalConsultation.create({
        data: {
          clientId: client.id,
          advisorId: advisor.id,
          topic,
          status: "ASSIGNED",
          agreedFee: agreedFee as any,
          platformFee: platformFee as any,
          clientShare: share as any,
          advisorShare: share as any,
          messages: [
            {
              role: "system",
              text: "تم فتح الاستشارة. عمولة المنصة 5% (2.5% + 2.5%). التواصل داخل الموقع فقط.",
              at: new Date().toISOString(),
            },
          ],
        },
      })
      return NextResponse.json({ ok: true, consultation: row })
    }

    if (action === "message") {
      const { consultationId, text, asAdvisor } = body
      if (!consultationId || !text) {
        return NextResponse.json({ error: "consultationId and text required" }, { status: 400 })
      }
      if (BLOCKED.test(String(text))) {
        return NextResponse.json(
          { error: "ممنوع أرقام التليفون أو الروابط أو وسائل تواصل خارجية" },
          { status: 400 }
        )
      }
      const row = await prisma.legalConsultation.findUnique({ where: { id: consultationId } })
      if (!row) return NextResponse.json({ error: "not found" }, { status: 404 })

      const msgs = Array.isArray(row.messages) ? [...(row.messages as any[])] : []
      msgs.push({
        role: asAdvisor ? "advisor" : "client",
        text: String(text).trim(),
        at: new Date().toISOString(),
      })

      const updated = await prisma.legalConsultation.update({
        where: { id: consultationId },
        data: {
          messages: msgs as any,
          status: row.status === "OPEN" ? "IN_PROGRESS" : row.status,
          advisorId: row.advisorId || advisor.id,
        },
      })
      return NextResponse.json({ ok: true, consultation: updated })
    }

    if (action === "complete") {
      const { consultationId } = body
      const updated = await prisma.legalConsultation.update({
        where: { id: consultationId },
        data: { status: "COMPLETED" },
      })
      return NextResponse.json({ ok: true, consultation: updated })
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 })
  }
}
