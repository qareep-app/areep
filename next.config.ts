import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add your storage domain later (R2, S3, Cloudinary...)
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
  // Needed for Vercel + Prisma
  experimental: {
    // serverComponentsExternalPackages is now serverExternalPackages in newer Next
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
}

export default withNextIntl(nextConfig)
