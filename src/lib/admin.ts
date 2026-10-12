import { getSession, type SessionUser } from "@/lib/session"

/** Normalize Egyptian mobile for ADMIN_PHONES comparison */
export function normalizePhone(phone: string): string {
  let p = String(phone || "").replace(/[\s\-()]/g, "")
  if (p.startsWith("+20")) p = "0" + p.slice(3)
  if (p.startsWith("20") && p.length >= 12) p = "0" + p.slice(2)
  return p
}

export function isAdminPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  const list = (process.env.ADMIN_PHONES || "")
    .split(/[,;\s]+/)
    .map((s) => normalizePhone(s))
    .filter(Boolean)
  const n = normalizePhone(phone)
  return list.includes(n)
}

/** Session is admin if role cookie says ADMIN OR phone is in ADMIN_PHONES */
export async function requireAdminSession(): Promise<SessionUser | null> {
  const session = await getSession()
  if (!session) return null
  if (session.role === "ADMIN") return session
  if (isAdminPhone(session.phone)) {
    return { ...session, role: "ADMIN" }
  }
  return null
}
