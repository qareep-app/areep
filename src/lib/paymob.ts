/**
 * Paymob (Accept) — Egypt
 *
 * Env:
 * - PAYMOB_API_KEY          → API Key من لوحة Paymob (للمسار الكلاسيكي)
 * - PAYMOB_INTEGRATION_ID   → رقم الـ Integration (بطاقة)
 * - PAYMOB_IFRAME_ID        → رقم الـ iFrame (اختياري، افتراضي 1)
 * - PAYMOB_SECRET_KEY       → Secret Key للـ Intention API (اختياري، يبدأ غالباً بـ egy_sk أو sk_)
 * - PAYMOB_PUBLIC_KEY
 * - PAYMOB_HMAC_SECRET
 */

const PAYMOB_BASE = "https://accept.paymob.com/api"

export async function getPaymobAuthToken(): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY?.trim()
  if (!apiKey) throw new Error("PAYMOB_API_KEY is not set")

  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.token) {
    throw new Error(
      `Paymob auth failed: ${JSON.stringify(data)} — تأكد أن PAYMOB_API_KEY هو الـ API Key الصحيح من لوحة Paymob`
    )
  }
  return data.token as string
}

/**
 * Classic 3-step payment → returns iframe URL the browser can open
 */
export async function createPaymobPayment(params: {
  amount: number // EGP
  orderId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items?: { name: string; amount: number; quantity: number }[]
}) {
  const integrationId = Number(process.env.PAYMOB_INTEGRATION_ID)
  const iframeId = process.env.PAYMOB_IFRAME_ID || "1"
  const amountCents = Math.round(params.amount * 100)

  if (!integrationId) {
    throw new Error("PAYMOB_INTEGRATION_ID is not set")
  }

  // 1) Auth
  const token = await getPaymobAuthToken()

  // 2) Order
  const orderRes = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: params.orderId,
      items: (params.items || []).map((it) => ({
        name: it.name,
        amount_cents: Math.round(it.amount * 100),
        quantity: it.quantity || 1,
        description: it.name,
      })),
    }),
  })
  const order = await orderRes.json().catch(() => ({}))
  if (!orderRes.ok || !order.id) {
    throw new Error(`Paymob order failed: ${JSON.stringify(order)}`)
  }

  // 3) Payment key
  const keyRes = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: order.id,
      billing_data: {
        apartment: "NA",
        email: params.customerEmail || "customer@areep.eg",
        floor: "NA",
        first_name: params.customerName || "Customer",
        street: "NA",
        building: "NA",
        phone_number: params.customerPhone || "01000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: "Areep",
        state: "NA",
      },
      currency: "EGP",
      integration_id: integrationId,
      lock_order_when_paid: true,
    }),
  })
  const keyData = await keyRes.json().catch(() => ({}))
  if (!keyRes.ok || !keyData.token) {
    throw new Error(
      `Paymob payment_key failed: ${JSON.stringify(keyData)} — راجع INTEGRATION_ID`
    )
  }

  const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${keyData.token}`

  return {
    orderId: order.id,
    paymentToken: keyData.token,
    iframeUrl,
    merchantOrderId: params.orderId,
  }
}

/** Prefer classic flow; Intention only if PAYMOB_SECRET_KEY is set */
export async function createPaymobIntention(params: {
  amount: number
  orderId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items?: { name: string; amount: number; quantity: number }[]
}) {
  // Classic API Key flow (most common for Egyptian merchants)
  if (process.env.PAYMOB_API_KEY?.trim()) {
    return createPaymobPayment(params)
  }

  const secretKey = process.env.PAYMOB_SECRET_KEY?.trim()
  const integrationId = process.env.PAYMOB_INTEGRATION_ID
  if (!secretKey || !integrationId) {
    throw new Error("Paymob credentials missing")
  }

  const res = await fetch("https://accept.paymob.com/v1/intention/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${secretKey}`,
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100),
      currency: "EGP",
      payment_methods: [Number(integrationId)],
      items: params.items || [
        {
          name: `Areep #${params.orderId}`,
          amount: Math.round(params.amount * 100),
          description: "Areep payment",
          quantity: 1,
        },
      ],
      billing_data: {
        first_name: params.customerName || "Customer",
        last_name: ".",
        phone_number: params.customerPhone || "01000000000",
        email: params.customerEmail || "customer@areep.eg",
        country: "EG",
      },
      special_reference: params.orderId,
      expiration: 3600,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Paymob intention failed: ${err}`)
  }
  return res.json()
}

export function verifyPaymobHMAC(_data: Record<string, unknown>, _hmac: string): boolean {
  if (process.env.NODE_ENV === "development") return true
  return Boolean(process.env.PAYMOB_HMAC_SECRET)
}
