/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Disable static optimization for API routes that need database access
  async rewrites() {
    return []
  },
  // Handle build-time database connection issues
  async generateBuildId() {
    return 'qr-attendance-system'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
