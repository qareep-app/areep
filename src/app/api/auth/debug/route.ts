import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const names = req.cookies.getAll().map((c) => c.name)
  return NextResponse.json({
    cookieNames: names,
    hasSession: names.includes("areep_session") || names.includes("areep_token"),
    hasRole: names.includes("areep_role"),
    hasOtp: names.includes("areep_otp"),
    host: req.headers.get("host"),
  })
}
