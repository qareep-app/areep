/**
 * Live visitor counter via Upstash Redis REST (optional).
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * Without env: returns zeros (no crash).
 */

const ONLINE_KEY = "areep:online"
const TODAY_KEY_PREFIX = "areep:day:"

function todayKey() {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${TODAY_KEY_PREFIX}${y}-${m}-${day}`
}

async function redis(
  command: (string | number)[]
): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

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
    console.error("Upstash error", await res.text())
    return null
  }
  const json = await res.json()
  return json?.result
}

/** Heartbeat: sessionId unique per browser tab (client-generated) */
export async function pingVisitor(sessionId: string) {
  if (!sessionId || sessionId.length > 64) {
    return { online: 0, today: 0, configured: false }
  }
  const member = sessionId.slice(0, 64)
  const now = Date.now()
  // ZADD score=now, ZREMRANGEBYSCORE older than 3 minutes, ZCARD
  await redis(["ZADD", ONLINE_KEY, now, member])
  await redis(["ZREMRANGEBYSCORE", ONLINE_KEY, 0, now - 3 * 60 * 1000])
  const online = Number((await redis(["ZCARD", ONLINE_KEY])) || 0)

  // HyperLogLog-ish unique today via PFADD
  const tk = todayKey()
  await redis(["PFADD", tk, member])
  await redis(["EXPIRE", tk, 60 * 60 * 48])
  const today = Number((await redis(["PFCOUNT", tk])) || 0)

  return {
    online,
    today,
    configured: Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ),
  }
}

export async function getVisitorStats() {
  const now = Date.now()
  await redis(["ZREMRANGEBYSCORE", ONLINE_KEY, 0, now - 3 * 60 * 1000])
  const online = Number((await redis(["ZCARD", ONLINE_KEY])) || 0)
  const today = Number((await redis(["PFCOUNT", todayKey()])) || 0)
  return {
    online,
    today,
    configured: Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ),
  }
}
