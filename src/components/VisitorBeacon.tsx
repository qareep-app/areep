"use client"

import { useEffect } from "react"

function getOrCreateSessionId() {
  try {
    const k = "areep_vid"
    let id = localStorage.getItem(k)
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(k, id)
    }
    return id
  } catch {
    return `v_${Date.now()}`
  }
}

/** يرسل نبضة كل 60 ثانية — لا يؤثر على الشكل */
export default function VisitorBeacon() {
  useEffect(() => {
    const sessionId = getOrCreateSessionId()
    const ping = () => {
      fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        keepalive: true,
      }).catch(() => {})
    }
    ping()
    const t = setInterval(ping, 60_000)
    return () => clearInterval(t)
  }, [])
  return null
}
