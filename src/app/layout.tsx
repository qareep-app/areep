import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import SplashScreen from "@/components/SplashScreen" // هنعمل الملف ده كمان

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "قريب | Areep - دكانك قريب",
  description: "أول وأكبر منصة إعلانات مبوبة في مصر - بيع واشتري من الناس اللي حواليك",
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
  return (
    <html className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SplashScreen />
        {children}
      </body>
    </html>
  )
}