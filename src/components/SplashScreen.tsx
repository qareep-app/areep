"use client"

import { useEffect, useState } from "react"

export default function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f2337",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash-icon.png"
          alt="قريب"
          width={140}
          height={140}
          style={{ borderRadius: 24, display: "block", margin: "0 auto" }}
        />
        <div style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginTop: 16 }}>
          قريب
        </div>
        <div style={{ color: "#fb923c", fontSize: 14, marginTop: 4 }}>
          دكانك قريب
        </div>
      </div>
    </div>
  )
}