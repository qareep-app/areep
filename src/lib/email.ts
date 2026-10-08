/**
 * Resend / Brevo transactional email
 */

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ ok: boolean; mode: string; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim()

  // With Resend test sender, always use onboarding@resend.dev unless custom domain set
  let from = (process.env.EMAIL_FROM || "").trim()
  if (resendKey) {
    if (!from || from.includes("areep.eg") || from.includes("noreply@")) {
      from = "Areep <onboarding@resend.dev>"
    }
    // Ensure format "Name <email>" or plain email
    if (!from.includes("@")) {
      from = "Areep <onboarding@resend.dev>"
    }
  } else {
    from = from || "Areep <noreply@areep.eg>"
  }

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
      const raw = await res.text()
      if (!res.ok) {
        let msg = raw
        try {
          const j = JSON.parse(raw)
          msg = j.message || j.error || raw
        } catch {}
        // Friendlier Arabic hints
        const lower = String(msg).toLowerCase()
        if (lower.includes("only send") || lower.includes("own email") || lower.includes("testing emails")) {
          msg =
            "Resend في وضع التجربة: تقدر تبعت فقط لإيميل حساب Resend نفسه. وثّق دومين أو استخدم إيميل الحساب المسجّل في Resend."
        }
        if (lower.includes("invalid") && lower.includes("from")) {
          msg = "عنوان المرسل غير مقبول — استخدم: Areep <onboarding@resend.dev>"
        }
        if (lower.includes("api key") || lower.includes("unauthorized") || res.status === 401) {
          msg = "مفتاح RESEND_API_KEY غير صحيح أو مش متسجّل على Vercel بعد Redeploy"
        }
        return { ok: false, mode: "resend", error: msg }
      }
      return { ok: true, mode: "resend" }
    } catch (e: any) {
      return { ok: false, mode: "resend", error: e?.message }
    }
  }

  const brevoKey = process.env.BREVO_API_KEY?.trim()
  if (brevoKey) {
    try {
      const senderEmail =
        (from.match(/<(.+)>/) || [])[1] || "noreply@areep.eg"
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "قريب", email: senderEmail },
          to: [{ email: params.to }],
          subject: params.subject,
          htmlContent: params.html,
          textContent: params.text,
        }),
      })
      if (!res.ok) {
        return { ok: false, mode: "brevo", error: await res.text() }
      }
      return { ok: true, mode: "brevo" }
    } catch (e: any) {
      return { ok: false, mode: "brevo", error: e?.message }
    }
  }

  console.log(`[EMAIL DEV] to=${params.to} subject=${params.subject}`)
  return { ok: true, mode: "dev" }
}
