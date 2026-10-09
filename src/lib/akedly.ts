/**
 * Akedly OTP
 * Env: AKEDLY_API_KEY, AKEDLY_PIPELINE_ID
 * Tries V1 create+activate, then V1.2 /transactions/send
 */

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

async function tryV1(
  APIKey: string,
  pipelineID: string,
  phoneNumber: string
): Promise<{ ok: boolean; transactionID?: string; transactionReqID?: string; channels?: string[]; error?: string }> {
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
      error: `V1 create: ${createData?.message || createData?.error || JSON.stringify(createData)} [${createRes.status}]`,
    }
  }

  const transactionID =
    createData?.data?.transactionID ||
    createData?.data?.mainTransactionID ||
    createData?.transactionID ||
    createData?.data?._id

  if (!transactionID) {
    return { ok: false, error: `V1 create: no transactionID ${JSON.stringify(createData)}` }
  }

  const actRes = await fetch(
    `https://api.akedly.io/api/v1/transactions/activate/${transactionID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }
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
    transactionReqID: String(
      actData?.data?._id || actData?.data?.transactionReqID || ""
    ),
    channels: actData?.channels || createData?.channels,
  }
}

async function tryV12(
  APIKey: string,
  pipelineID: string,
  phoneNumber: string
): Promise<{ ok: boolean; transactionID?: string; transactionReqID?: string; channels?: string[]; error?: string }> {
  const res = await fetch("https://api.akedly.io/api/v1.2/transactions/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-end-user-ip": "127.0.0.1",
    },
    body: JSON.stringify({
      APIKey,
      pipelineID,
      verificationAddress: { phoneNumber },
      digits: 6,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      error: `V1.2 send: ${data?.message || data?.error || JSON.stringify(data)} [${res.status}]`,
    }
  }
  const transactionID =
    data?.data?.transactionID || data?.transactionID || data?.data?.mainTransactionID
  if (!transactionID) {
    return { ok: false, error: `V1.2: no transactionID ${JSON.stringify(data)}` }
  }
  return {
    ok: true,
    transactionID: String(transactionID),
    transactionReqID: data?.data?.transactionReqID
      ? String(data.data.transactionReqID)
      : undefined,
    channels: data?.data?.channels || data?.channels,
  }
}

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
    return { ok: false, error: "AKEDLY_API_KEY or AKEDLY_PIPELINE_ID missing on server" }
  }

  const phoneNumber = e164Egypt(phone)
  const v1 = await tryV1(APIKey, pipelineID, phoneNumber)
  if (v1.ok) return v1

  const v12 = await tryV12(APIKey, pipelineID, phoneNumber)
  if (v12.ok) return v12

  return {
    ok: false,
    error: `${v1.error} | ${v12.error}`,
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

  // try v1 verify
  const res = await fetch("https://api.akedly.io/api/v1/transactions/verify", {
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
  if (res.ok && (data?.status === "success" || data?.data?.status === "Verified" || data?.data?.status === "verified")) {
    return { ok: true }
  }
  if (res.ok && data?.status === "success") return { ok: true }

  // v1.2 verify path if documented similarly
  const res2 = await fetch("https://api.akedly.io/api/v1.2/transactions/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      APIKey,
      pipelineID,
      transactionID: params.transactionID,
      otp: params.otp,
    }),
  })
  const data2 = await res2.json().catch(() => ({}))
  if (res2.ok && (data2?.status === "success" || data2?.data?.verified)) {
    return { ok: true }
  }

  return {
    ok: false,
    error:
      data2?.message ||
      data?.message ||
      JSON.stringify(data2 || data) ||
      "Verify failed",
  }
}
