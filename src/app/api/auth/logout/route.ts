import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ success: true })
  const opts = { path: "/", maxAge: 0 }
  res.cookies.set("areep_session", "", opts)
  res.cookies.set("areep_token", "", opts)
  res.cookies.set("areep_role", "", opts)
  res.cookies.set("areep_otp", "", opts)
  res.cookies.set("areep_pending_pkg", "", opts)
  return res
}

export async function GET() {
  return POST()
}
