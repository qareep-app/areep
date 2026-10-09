import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    configured: Boolean(
      process.env.PAYMOB_API_KEY?.trim() && process.env.PAYMOB_INTEGRATION_ID
    ),
    hasApiKey: Boolean(process.env.PAYMOB_API_KEY?.trim()),
    hasIntegrationId: Boolean(process.env.PAYMOB_INTEGRATION_ID),
    iframeId: process.env.PAYMOB_IFRAME_ID || "1082164",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
  })
}
