import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"

export const SESSION_COOKIE = "areep_session"
export const TOKEN_COOKIE = "areep_token"
export const ROLE_COOKIE = "areep_role"

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

const cookieOpts = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies()
  return decodeSession(jar.get(SESSION_COOKIE)?.value)
}

/** Attach session cookies to a NextResponse (reliable on Vercel) */
export function attachSessionCookies(res: NextResponse, user: SessionUser) {
  const token = encodeSession(user)
  res.cookies.set(SESSION_COOKIE, token, cookieOpts)
  res.cookies.set(TOKEN_COOKIE, token, cookieOpts)
  res.cookies.set(ROLE_COOKIE, user.role, {
    ...cookieOpts,
    httpOnly: false, // readable by middleware / client hints
  })
  return res
}

export function clearSessionOnResponse(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOpts, maxAge: 0 })
  res.cookies.set(TOKEN_COOKIE, "", { ...cookieOpts, maxAge: 0 })
  res.cookies.set(ROLE_COOKIE, "", { ...cookieOpts, maxAge: 0, httpOnly: false })
  return res
}

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies()
  const token = encodeSession(user)
  jar.set(SESSION_COOKIE, token, cookieOpts)
  jar.set(TOKEN_COOKIE, token, cookieOpts)
  jar.set(ROLE_COOKIE, user.role, { ...cookieOpts, httpOnly: false })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(TOKEN_COOKIE)
  jar.delete(ROLE_COOKIE)
}
