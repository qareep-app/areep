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

  const isAdminRoute = locales.some((locale) =>
    pathname.startsWith(`/${locale}/admin`)
  )

  if (isAdminRoute) {
    const role = req.cookies.get("areep_role")?.value
    const token =
      req.cookies.get("areep_token")?.value ||
      req.cookies.get("areep_session")?.value

    if (!token || role !== "ADMIN") {
      const locale = pathname.split("/")[1] || defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
}
