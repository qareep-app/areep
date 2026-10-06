/**
 * Paymob integration helper (Egypt)
 * Docs: https://developers.paymob.com
 *
 * Required env vars (see .env.example):
 * - PAYMOB_API_KEY
 * - PAYMOB_INTEGRATION_ID
 * - PAYMOB_WALLET_INTEGRATION_ID
 * - PAYMOB_HMAC_SECRET
 * - PAYMOB_PUBLIC_KEY
 */

const PAYMOB_BASE = "https://accept.paymob.com/api"

export async function getPaymobAuthToken(): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY
  if (!apiKey) throw new Error("PAYMOB_API_KEY is not set")

  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  })

  if (!res.ok) throw new Error("Paymob auth failed")
  const data = await res.json()
  return data.token
}

/**
 * Create a payment intention (modern Paymob API)
 * amount is in EGP (will be converted to cents)
 */
export async function createPaymobIntention(params: {
  amount: number // EGP
  orderId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items?: { name: string; amount: number; quantity: number }[]
}) {
  const secretKey = process.env.PAYMOB_API_KEY // or dedicated secret
  const integrationId = process.env.PAYMOB_INTEGRATION_ID

  if (!secretKey || !integrationId) {
    throw new Error("Paymob credentials missing")
  }

  // Using Intention API (recommended)
  const res = await fetch("https://accept.paymob.com/v1/intention/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${secretKey}`,
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100), // cents
      currency: "EGP",
      payment_methods: [Number(integrationId)],
      items: params.items || [
        {
          name: `Areep Escrow #${params.orderId}`,
          amount: Math.round(params.amount * 100),
          description: "Escrow payment via Areep",
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
      expiration: 3600, // 1 hour
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Paymob intention failed: ${err}`)
  }

  return res.json()
}

/**
 * Verify Paymob webhook HMAC (security)
 */
export function verifyPaymobHMAC(data: Record<string, any>, hmac: string): boolean {
  // Implement according to Paymob docs using PAYMOB_HMAC_SECRET
  // For now return true in development
  if (process.env.NODE_ENV === "development") return true
  // TODO: real HMAC verification
  return false
}
