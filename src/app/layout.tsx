import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "قريب | Areep - دكانك قريب",
  description: "منصة الإعلانات المبوبة في مصر - بيع واشتري من الناس اللي حواليك",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: "/icons/favicon-32.png",
    shortcut: "/icons/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "قريب",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const splashCss =
    "#areep-splash{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#0f2337;transition:opacity .4s ease}" +
    "#areep-splash.hide{opacity:0;pointer-events:none}" +
    "#areep-splash img{width:140px;height:140px;border-radius:24px;display:block;margin:0 auto}" +
    "#areep-splash .t1{color:#fff;font-size:24px;font-weight:700;margin-top:16px;text-align:center;font-family:system-ui,sans-serif}" +
    "#areep-splash .t2{color:#fb923c;font-size:14px;margin-top:4px;text-align:center;font-family:system-ui,sans-serif}"

  const splashJs =
    "(function(){var s=document.getElementById('areep-splash');if(!s)return;" +
    "setTimeout(function(){s.classList.add('hide');},2500);" +
    "setTimeout(function(){if(s&&s.parentNode)s.parentNode.removeChild(s);},3000);})();"

  return (
    <html className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <style dangerouslySetInnerHTML={{ __html: splashCss }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div id="areep-splash">
          <div>
            <img src="/splash-icon.png" alt="قريب" width={140} height={140} />
            <div className="t1">قريب</div>
            <div className="t2">دكانك قريب</div>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: splashJs }} />
        {children}
      </body>
    </html>
  )
}