/**
 * Akedly OTP — V1.2 primary (with server-side PoW), V1 fallback
 * Env: AKEDLY_API_KEY, AKEDLY_PIPELINE_ID
 */
import crypto from "crypto"

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

/** Solve PoW: find nonce such that sha256(challenge:nonce) has `difficulty` leading hex zeros */
function solvePow(challenge: string, difficulty: number, maxNonce = 5_000_000): number {
  const prefix = "0".repeat(difficulty)
  for (let nonce = 0; nonce < maxNonce; nonce++) {
    const hash = crypto
      .createHash("sha256")
      .update(`${challenge}:${nonce}`)
      .digest("hex")
    if (hash.startsWith(prefix)) return nonce
  }
  throw new Error("PoW solve timeout")
}

async function tryV12(
  APIKey: string,
  pipelineID: string,
  phoneNumber: string
): Promise<{
  ok: boolean
  transactionID?: string
  transactionReqID?: string
  channels?: string[]
  error?: string
}> {
  // Step 1: challenge
  const chUrl =
    `https://api.akedly.io/api/v1.2/transactions/challenge` +
    `?APIKey=${encodeURIComponent(APIKey)}` +
    `&pipelineID=${encodeURIComponent(pipelineID)}`

  const chRes = await fetch(chUrl)
  const chData = await chRes.json().catch(() => ({}))
  if (!chRes.ok) {
    return {
      ok: false,
      error: `V1.2 challenge: ${chData?.message || chData?.error || JSON.stringify(chData)} [${chRes.status}]`,
    }
  }

  const payload = chData?.data || chData
  let powSolution: { challengeToken: string; nonce: number } | undefined

  if (payload?.challengeRequired === true) {
    try {
      const nonce = solvePow(
        String(payload.challenge),
        Number(payload.difficulty || 3)
      )
      powSolution = {
        challengeToken: String(payload.challengeToken),
        nonce,
      }
    } catch (e: any) {
      return { ok: false, error: `PoW failed: ${e?.message}` }
    }
  }

  // Step 2: send
  const body: Record<string, unknown> = {
    APIKey,
    pipelineID,
    verificationAddress: { phoneNumber },
    digits: 6,
  }
  if (powSolution) body.powSolution = powSolution

  const sendRes = await fetch("https://api.akedly.io/api/v1.2/transactions/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-end-user-ip": "127.0.0.1",
    },
    body: JSON.stringify(body),
  })
  const sendData = await sendRes.json().catch(() => ({}))
  if (!sendRes.ok) {
    return {
      ok: false,
      error: `V1.2 send: ${sendData?.message || sendData?.error || JSON.stringify(sendData)} [${sendRes.status}]`,
    }
  }

  const data = sendData?.data || sendData
  const transactionID = data?.transactionID || data?.mainTransactionID
  if (!transactionID) {
    return { ok: false, error: `V1.2: no transactionID ${JSON.stringify(sendData)}` }
  }

  return {
    ok: true,
    transactionID: String(transactionID),
    transactionReqID: data?.transactionReqID
      ? String(data.transactionReqID)
      : undefined,
    channels: data?.channels || sendData?.channels,
  }
}

async function tryV1(
  APIKey: string,
  pipelineID: string,
  phoneNumber: string
): Promise<{
  ok: boolean
  transactionID?: string
  transactionReqID?: string
  channels?: string[]
  error?: string
}> {
  const createRes = await fetch("https://api.akedly.io/api/v1/transactions", {
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
      error: `V1 create: ${createData?.message || JSON.stringify(createData)} [${createRes.status}]`,
    }
  }

  const transactionID =
    createData?.data?.transactionID ||
    createData?.data?.mainTransactionID ||
    createData?.transactionID

  if (!transactionID) {
    return { ok: false, error: "V1: no transactionID" }
  }

  const actRes = await fetch(
    `https://api.akedly.io/api/v1/transactions/activate/${transactionID}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }
  )
  const actData = await actRes.json().catch(() => ({}))
  if (!actRes.ok) {
    return {
      ok: false,
      error: `V1 activate: ${actData?.message || JSON.stringify(actData)} [${actRes.status}]`,
    }
  }

  return {
    ok: true,
    transactionID: String(transactionID),
    transactionReqID: actData?.data?._id
      ? String(actData.data._id)
      : undefined,
    channels: actData?.channels,
  }
}

export async function akedlySendOtp(phone: string) {
  const APIKey = process.env.AKEDLY_API_KEY?.trim()
  const pipelineID = process.env.AKEDLY_PIPELINE_ID?.trim()
  if (!APIKey || !pipelineID) {
    return { ok: false as const, error: "AKEDLY_API_KEY or AKEDLY_PIPELINE_ID missing" }
  }

  const phoneNumber = e164Egypt(phone)

  // V1.2 first (your pipeline type)
  const v12 = await tryV12(APIKey, pipelineID, phoneNumber)
  if (v12.ok) return v12

  const v1 = await tryV1(APIKey, pipelineID, phoneNumber)
  if (v1.ok) return v1

  return {
    ok: false as const,
    error: `${v12.error} | ${v1.error}`,
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

  // V1.2 verify prefers transactionReqID
  const body12: Record<string, unknown> = {
    APIKey,
    pipelineID,
    otp: params.otp,
    transactionID: params.transactionID,
  }
  if (params.transactionReqID) {
    body12.transactionReqID = params.transactionReqID
  }

  const res12 = await fetch("https://api.akedly.io/api/v1.2/transactions/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body12),
  })
  const data12 = await res12.json().catch(() => ({}))
  if (res12.ok && (data12?.status === "success" || data12?.data?.verified || data12?.data?.status === "Verified")) {
    return { ok: true }
  }

  const res1 = await fetch("https://api.akedly.io/api/v1/transactions/verify", {
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
  const data1 = await res1.json().catch(() => ({}))
  if (res1.ok && (data1?.status === "success" || data1?.data?.status === "Verified")) {
    return { ok: true }
  }

  return {
    ok: false,
    error:
      data12?.message ||
      data1?.message ||
      JSON.stringify(data12 || data1) ||
      "Verify failed",
  }
}
