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
      { url: "/app-icon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/app-icon.png",
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
  return (
    <html className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/app-icon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('areep-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
#areep-splash{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#0f2337;overflow:hidden}
#areep-splash .curtain{position:absolute;top:0;bottom:0;width:50%;background:#0f2337;z-index:2;transition:transform 1s cubic-bezier(.65,0,.35,1)}
#areep-splash .curtain.left{left:0;transform:translateX(0);border-right:1px solid rgba(255,255,255,.06)}
#areep-splash .curtain.right{right:0;transform:translateX(0);border-left:1px solid rgba(255,255,255,.06)}
#areep-splash.open .curtain.left{transform:translateX(-105%)}
#areep-splash.open .curtain.right{transform:translateX(105%)}
#areep-splash .center{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:12px;transition:opacity .5s ease,transform .5s ease}
#areep-splash.open .center{opacity:0;transform:scale(.92)}
#areep-splash img{width:128px;height:128px;border-radius:28px;object-fit:cover;box-shadow:0 16px 48px rgba(0,0,0,.45)}
#areep-splash .t1{color:#fff;font-size:28px;font-weight:700;font-family:system-ui,sans-serif}
#areep-splash .t2{color:#fb923c;font-size:14px;font-family:system-ui,sans-serif}
#areep-splash.hide{opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s ease,visibility .3s}
`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    if (sessionStorage.getItem('areep_splash_done') === '1') return;
  } catch (e) {}
  var el = document.createElement('div');
  el.id = 'areep-splash';
  el.innerHTML =
    '<div class="curtain left"></div>' +
    '<div class="curtain right"></div>' +
    '<div class="center">' +
      '<img src="/app-icon.png?v=3" alt="قريب" width="128" height="128"/>' +
      '<div class="t1">قريب</div>' +
      '<div class="t2">دكانك قريب</div>' +
    '</div>';
  function mount(){
    if (document.body) document.body.appendChild(el);
    else document.documentElement.appendChild(el);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  // hold 3s then open curtains
  setTimeout(function(){
    el.classList.add('open');
    setTimeout(function(){
      el.classList.add('hide');
      try { sessionStorage.setItem('areep_splash_done','1'); } catch(e) {}
      setTimeout(function(){ try{ el.remove(); }catch(e){} }, 400);
    }, 1000);
  }, 3000);
})();
`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}
