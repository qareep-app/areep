/**
 * Akedly OTP (Egypt-friendly: WhatsApp / SMS / Telegram)
 * Env:
 * - AKEDLY_API_KEY
 * - AKEDLY_PIPELINE_ID
 *
 * Uses V1 create + activate + verify (no PoW required on server).
 * Docs: https://docs.akedly.io/
 */

const BASE = "https://api.akedly.io/api/v1"

function e164Egypt(phone: string) {
  const p = phone.replace(/\s/g, "")
  if (p.startsWith("+")) return p
  if (p.startsWith("20")) return `+${p}`
  if (p.startsWith("0")) return `+20${p.slice(1)}`
  return `+20${p}`
}

export function isAkedlyConfigured() {
  return Boolean(
    process.env.AKEDLY_API_KEY?.trim() && process.env.AKEDLY_PIPELINE_ID?.trim()
  )
}

/** Create + activate → OTP delivered. Returns transaction ids for verify. */
export async function akedlySendOtp(phone: string): Promise<{
  ok: boolean
  transactionID?: string
  transactionReqID?: string
  channels?: string[]
  error?: string
}> {
  const APIKey = process.env.AKEDLY_API_KEY?.trim()
  const pipelineID = process.env.AKEDLY_PIPELINE_ID?.trim()
  if (!APIKey || !pipelineID) {
    return { ok: false, error: "AKEDLY_API_KEY or AKEDLY_PIPELINE_ID missing" }
  }

  const phoneNumber = e164Egypt(phone)

  // Step 1: create
  const createRes = await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      APIKey,
      pipelineID,
      verificationAddress: { phoneNumber },
      digits: 6,
    }),
  })
  const createData = await createRes.json().catch(() => ({}))
  if (!createRes.ok) {
    return {
      ok: false,
      error: createData?.message || JSON.stringify(createData),
    }
  }

  const transactionID =
    createData?.data?.transactionID ||
    createData?.data?.mainTransactionID ||
    createData?.transactionID ||
    createData?.data?._id

  if (!transactionID) {
    return { ok: false, error: "No transactionID from Akedly create" }
  }

  // Step 2: activate (sends OTP)
  const actRes = await fetch(`${BASE}/transactions/activate/${transactionID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
  const actData = await actRes.json().catch(() => ({}))
  if (!actRes.ok) {
    return {
      ok: false,
      error: actData?.message || JSON.stringify(actData),
    }
  }

  const transactionReqID =
    actData?.data?._id ||
    actData?.data?.transactionReqID ||
    createData?.data?.transactionReqID

  return {
    ok: true,
    transactionID: String(transactionID),
    transactionReqID: transactionReqID ? String(transactionReqID) : undefined,
    channels: actData?.channels || createData?.channels,
  }
}

export async function akedlyVerifyOtp(params: {
  transactionID: string
  otp: string
  transactionReqID?: string
}): Promise<{ ok: boolean; error?: string }> {
  const APIKey = process.env.AKEDLY_API_KEY?.trim()
  const pipelineID = process.env.AKEDLY_PIPELINE_ID?.trim()
  if (!APIKey || !pipelineID) {
    return { ok: false, error: "Akedly not configured" }
  }

  const res = await fetch(`${BASE}/transactions/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      APIKey,
      pipelineID,
      transactionID: params.transactionID,
      otp: params.otp,
      ...(params.transactionReqID
        ? { transactionReqID: params.transactionReqID }
        : {}),
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, error: data?.message || JSON.stringify(data) }
  }
  const status = (data?.status || data?.data?.status || "").toString().toLowerCase()
  if (status && status !== "success" && status !== "verified" && status !== "pending") {
    // some APIs return success at top level only
    if (data?.status !== "success") {
      return { ok: false, error: data?.message || "Verify failed" }
    }
  }
  return { ok: true }
}
