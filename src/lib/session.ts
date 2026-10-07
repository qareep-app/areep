import { cookies } from "next/headers"
import crypto from "crypto"

const COOKIE = "areep_session"
const SECRET = process.env.SESSION_SECRET || "areep-demo-secret-change-me"

export type SessionUser = {
  id: string
  phone: string
  name: string | null
  role: string
}

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex")
}

export function encodeSession(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url")
  const sig = sign(payload)
  return `${payload}.${sig}`
}

export function decodeSession(token: string | undefined | null): SessionUser | null {
  if (!token) return null
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return null
  if (sign(payload) !== sig) return null
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies()
  return decodeSession(jar.get(COOKIE)?.value)
}

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies()
  jar.set(COOKIE, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(COOKIE)
}
