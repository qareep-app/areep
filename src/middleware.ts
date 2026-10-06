import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { locales, defaultLocale } from "./i18n/config"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin routes (any locale)
  const isAdminRoute = locales.some(
    (locale) => pathname.startsWith(`/${locale}/admin`)
  )

  if (isAdminRoute) {
    // Simple check: look for role in a cookie (set after login)
    // In production replace with proper JWT verification
    const token = req.cookies.get("areep_token")?.value
    const role = req.cookies.get("areep_role")?.value

    // Allow in development for easier testing
    if (process.env.NODE_ENV === "production") {
      if (!token || role !== "ADMIN") {
        const locale = pathname.split("/")[1] || defaultLocale
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
      }
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
}
