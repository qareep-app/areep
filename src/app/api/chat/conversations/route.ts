import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ conversations: [] })
  }
  // Real chat storage can be wired later; no fake rows
  return NextResponse.json({ conversations: [] })
}
