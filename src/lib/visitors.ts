/**
 * Live visitor counter via Upstash Redis REST (optional).
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 */

const ONLINE_KEY = "areep:online"
const TODAY_KEY_PREFIX = "areep:day:"

function cleanEnv(v: string | undefined): string {
  if (!v) return ""
  return v
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
}

function todayKey() {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${TODAY_KEY_PREFIX}${y}-${m}-${day}`
}

function isConfigured() {
  const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL)
  const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN)
  return Boolean(url.startsWith("https://") && token.length > 8)
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL)
  const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN)
  if (!url.startsWith("https://") || !token) return null

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    })
    if (!res.ok) {
      const t = await res.text().catch(() => "")
      console.error("Upstash HTTP", res.status, t.slice(0, 200))
      return null
    }
    const json = await res.json()
    return json?.result
  } catch (e: any) {
    console.error("Upstash fetch", e?.message)
    return null
  }
}

export async function pingVisitor(sessionId: string) {
  if (!sessionId || sessionId.length > 64) {
    return { online: 0, today: 0, configured: isConfigured() }
  }
  if (!isConfigured()) {
    return { online: 0, today: 0, configured: false }
  }

  const member = sessionId.slice(0, 64)
  const now = Date.now()
  await redis(["ZADD", ONLINE_KEY, now, member])
  await redis(["ZREMRANGEBYSCORE", ONLINE_KEY, 0, now - 3 * 60 * 1000])
  const online = Number((await redis(["ZCARD", ONLINE_KEY])) || 0)

  const tk = todayKey()
  await redis(["PFADD", tk, member])
  await redis(["EXPIRE", tk, 60 * 60 * 48])
  const today = Number((await redis(["PFCOUNT", tk])) || 0)

  return { online, today, configured: true }
}

export async function getVisitorStats() {
  if (!isConfigured()) {
    return { online: 0, today: 0, configured: false }
  }
  const now = Date.now()
  await redis(["ZREMRANGEBYSCORE", ONLINE_KEY, 0, now - 3 * 60 * 1000])
  const online = Number((await redis(["ZCARD", ONLINE_KEY])) || 0)
  const today = Number((await redis(["PFCOUNT", todayKey()])) || 0)
  return { online, today, configured: true }
}
