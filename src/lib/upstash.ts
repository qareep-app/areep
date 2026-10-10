/** Optional Upstash Redis REST (no SDK). Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN */

export function upstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function cmd(command: (string | number)[]) {
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
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  return data?.result ?? null
}

export async function presencePing(visitorId: string) {
  if (!upstashConfigured()) return false
  const key = `areep:presence:${visitorId}`
  // set with 10 min TTL
  await cmd(["SET", key, String(Date.now()), "EX", 600])
  // maintain a set of active ids
  await cmd(["SADD", "areep:presence:ids", visitorId])
  await cmd(["EXPIRE", "areep:presence:ids", 600])
  return true
}

export async function presenceCount(): Promise<number | null> {
  if (!upstashConfigured()) return null
  const ids = (await cmd(["SMEMBERS", "areep:presence:ids"])) as string[] | null
  if (!Array.isArray(ids) || ids.length === 0) return 0
  let alive = 0
  for (const id of ids.slice(0, 500)) {
    const v = await cmd(["EXISTS", `areep:presence:${id}`])
    if (v === 1 || v === "1") alive++
    else await cmd(["SREM", "areep:presence:ids", id])
  }
  return alive
}
