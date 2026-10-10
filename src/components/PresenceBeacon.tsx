"use client"

import { useEffect } from "react"

/** Pings server so lastActiveAt stays fresh for online stats */
export default function PresenceBeacon() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/presence", { method: "POST", credentials: "include" }).catch(() => {})
    }
    ping()
    const t = setInterval(ping, 2 * 60 * 1000)
    return () => clearInterval(t)
  }, [])
  return null
}
