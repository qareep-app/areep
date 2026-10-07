/**
 * Send SMS to Egyptian mobile numbers.
 * Providers (set in env):
 * - TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM
 * - SMS_API_URL + SMS_API_KEY (generic JSON POST)
 * If none configured → returns { ok:false, mode:"dev" } and caller can show OTP in response for demo.
 */

export async function sendSms(
  phone: string,
  message: string
): Promise<{ ok: boolean; mode: "twilio" | "generic" | "dev"; error?: string }> {
  const e164 = phone.startsWith("+") ? phone : `+20${phone.replace(/^0/, "")}`

  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM

  if (sid && token && from) {
    try {
      const auth = Buffer.from(`${sid}:${token}`).toString("base64")
      const body = new URLSearchParams({
        To: e164,
        From: from,
        Body: message,
      })
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        }
      )
      if (!res.ok) {
        const err = await res.text()
        console.error("Twilio error", err)
        return { ok: false, mode: "twilio", error: err }
      }
      return { ok: true, mode: "twilio" }
    } catch (e: any) {
      return { ok: false, mode: "twilio", error: e?.message }
    }
  }

  const apiUrl = process.env.SMS_API_URL
  const apiKey = process.env.SMS_API_KEY
  if (apiUrl && apiKey) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ phone: e164, message, to: e164, text: message }),
      })
      if (!res.ok) {
        const err = await res.text()
        return { ok: false, mode: "generic", error: err }
      }
      return { ok: true, mode: "generic" }
    } catch (e: any) {
      return { ok: false, mode: "generic", error: e?.message }
    }
  }

  // No provider — dev/demo mode
  console.log(`[SMS DEV] to=${phone} msg=${message}`)
  return { ok: true, mode: "dev" }
}
