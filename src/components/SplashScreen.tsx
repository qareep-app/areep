"use client"

import { useEffect, useState } from "react"

export default function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // يظهر الـ Splash لمدة 2.5 ثانية ثم يختفي بلطف
    const timer = setTimeout(() => {
      setShow(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div
      id="areep-splash"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0f2337] transition-opacity duration-400"
    >
      <div className="text-center">
        <img
          src="/splash-icon.png"
          alt="قريب"
          width={140}
          height={140}
          className="mx-auto rounded-3xl"
        />
        <div className="mt-4 text-2xl font-bold text-white">قريب</div>
        <div className="mt-1 text-sm text-orange-400">دكانك قريب</div>
      </div>
    </div>
  )
}