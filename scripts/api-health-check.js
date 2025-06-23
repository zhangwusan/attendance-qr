// Quick health check for all API endpoints
const endpoints = [
  { path: "/api/health", method: "GET", auth: false },
  { path: "/api/auth/login", method: "POST", auth: false },
  { path: "/api/auth/me", method: "GET", auth: true },
  { path: "/api/courses", method: "GET", auth: true, role: "teacher" },
  { path: "/api/sessions/active", method: "GET", auth: true, role: "teacher" },
  { path: "/api/admin/users", method: "GET", auth: true, role: "teacher" },
  { path: "/api/admin/stats", method: "GET", auth: true, role: "teacher" },
]

async function quickHealthCheck() {
  console.log("🏥 Quick API Health Check...")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
      })

      const status = response.status
      const statusText = response.statusText

      if (endpoint.auth && status === 401) {
        console.log(`✅ ${endpoint.path} - Auth required (${status})`)
      } else if (status < 500) {
        console.log(`✅ ${endpoint.path} - Accessible (${status})`)
      } else {
        console.log(`❌ ${endpoint.path} - Server error (${status} ${statusText})`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.path} - Connection failed:`, error.message)
    }
  }

  console.log("✨ Health check complete!")
}

quickHealthCheck()
