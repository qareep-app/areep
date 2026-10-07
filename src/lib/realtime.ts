import crypto from "crypto"

/** Trigger a Pusher event via HTTP (no SDK required on server) */
export async function publishRealtime(
  channel: string,
  event: string,
  data: unknown
): Promise<{ ok: boolean; mode: "pusher" | "none" }> {
  const appId = process.env.PUSHER_APP_ID
  const key = process.env.PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.PUSHER_CLUSTER || "eu"

  if (!appId || !key || !secret) {
    return { ok: false, mode: "none" }
  }

  const body = JSON.stringify({
    name: event,
    channel,
    data: JSON.stringify(data),
  })
  const path = `/apps/${appId}/events`
  const bodyMd5 = crypto.createHash("md5").update(body).digest("hex")
  const authTimestamp = Math.floor(Date.now() / 1000)
  const authVersion = "1.0"
  const query = `auth_key=${key}&auth_timestamp=${authTimestamp}&auth_version=${authVersion}&body_md5=${bodyMd5}`
  const stringToSign = `POST\n${path}\n${query}`
  const authSignature = crypto
    .createHmac("sha256", secret)
    .update(stringToSign)
    .digest("hex")

  const url = `https://api-${cluster}.pusher.com${path}?${query}&auth_signature=${authSignature}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  if (!res.ok) {
    console.error("Pusher trigger failed", await res.text())
    return { ok: false, mode: "pusher" }
  }
  return { ok: true, mode: "pusher" }
}

export function getPublicRealtimeConfig() {
  return {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY || "",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "eu",
    enabled: Boolean(
      process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY
    ),
  }
}
