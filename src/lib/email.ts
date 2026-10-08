/**
 * Transactional email via Resend or Brevo.
 * Env:
 * - RESEND_API_KEY + EMAIL_FROM
 * - or BREVO_API_KEY + EMAIL_FROM
 */

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ ok: boolean; mode: string; error?: string }> {
  const from = process.env.EMAIL_FROM || "قريب <noreply@areep.eg>"

  const resendKey = process.env.RESEND_API_KEY?.trim()
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        return { ok: false, mode: "resend", error: err }
      }
      return { ok: true, mode: "resend" }
    } catch (e: any) {
      return { ok: false, mode: "resend", error: e?.message }
    }
  }

  const brevoKey = process.env.BREVO_API_KEY?.trim()
  if (brevoKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "قريب",
            email: (from.match(/<(.+)>/) || [])[1] || "noreply@areep.eg",
          },
          to: [{ email: params.to }],
          subject: params.subject,
          htmlContent: params.html,
          textContent: params.text,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        return { ok: false, mode: "brevo", error: err }
      }
      return { ok: true, mode: "brevo" }
    } catch (e: any) {
      return { ok: false, mode: "brevo", error: e?.message }
    }
  }

  console.log(`[EMAIL DEV] to=${params.to} subject=${params.subject}`)
  return { ok: true, mode: "dev" }
}
