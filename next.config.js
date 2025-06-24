/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway production optimizations
  output: "standalone",

  // Disable telemetry in production
  telemetry: false,

  // Optimize for Railway deployment
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
  },

  // Environment-specific configurations
  env: {
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT_NAME || "development",
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking
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

  // Redirect HTTP to HTTPS in production
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
