/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: "standalone" for development
  // output: "standalone", // Only needed for production

  // Disable telemetry in production
  telemetry: false,

  // Remove deprecated experimental options
  experimental: {
    // Remove serverComponentsExternalPackages - no longer needed in Next.js 15
  },

  // Environment-specific configurations
  env: {
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT_NAME || "development",
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  // Only redirect in production
  async redirects() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/(.*)",
          has: [
            {
              type: "header",
              key: "x-forwarded-proto",
              value: "http",
            },
          ],
          destination: "https://:host/:path*",
          permanent: true,
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig
