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
    icon: [
      { url: "/app-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/app-icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/app-icon.png",
    apple: "/app-icon.png",
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
  return (
    <html className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/app-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/app-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('areep-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
#areep-splash{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#0f2337;transition:opacity .4s ease}
#areep-splash.hide{opacity:0;pointer-events:none}
#areep-splash .box{display:flex;flex-direction:column;align-items:center;gap:10px}
#areep-splash img{width:120px;height:120px;border-radius:28px;display:block;object-fit:cover;box-shadow:0 16px 48px rgba(0,0,0,.4)}
#areep-splash .t1{color:#fff;font-size:26px;font-weight:700;text-align:center;font-family:system-ui,sans-serif}
#areep-splash .t2{color:#fb923c;font-size:14px;text-align:center;font-family:system-ui,sans-serif}
`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div id="areep-splash">
          <div className="box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icon.png" alt="قريب" width={120} height={120} />
            <div className="t1">قريب</div>
            <div className="t2">دكانك قريب</div>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var s=document.getElementById('areep-splash');
  if(!s) return;
  setTimeout(function(){ s.classList.add('hide'); }, 2500);
  setTimeout(function(){ if(s&&s.parentNode) s.parentNode.removeChild(s); }, 3000);
})();
`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
