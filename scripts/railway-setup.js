// Railway Production Setup Script
import { sql } from "../lib/db.js"

async function setupRailwayProduction() {
  console.log("🚂 Setting up Railway Production Environment...")

  try {
    // Check database connection
    console.log("Checking database connection...")
    const dbTest = await sql`SELECT NOW() as current_time`
    console.log("✅ Database connected:", dbTest[0].current_time)

    // Check if tables exist
    console.log("Checking database schema...")
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const requiredTables = ["users", "courses", "sessions", "attendance_records"]
    const existingTables = tables.map((t) => t.table_name)
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    if (missingTables.length > 0) {
      console.log("❌ Missing tables:", missingTables)
      console.log("Run database migrations first!")
      return false
    }

    console.log("✅ All required tables exist")

    // Check for admin user
    console.log("Checking for admin user...")
    const adminUsers = await sql`
      SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1
    `

    if (adminUsers.length === 0) {
      console.log("⚠️  No admin user found. Creating default admin...")

      const { hashPassword } = await import("../lib/auth.js")
      const adminPassword = await hashPassword("admin123")

      await sql`
        INSERT INTO users (email, password_hash, name, role, created_at)
        VALUES ('admin@railway.app', ${adminPassword}, 'Railway Admin', 'admin', NOW())
      `

      console.log("✅ Default admin created: admin@railway.app / admin123")
      console.log("🔒 IMPORTANT: Change this password immediately!")
    } else {
      console.log("✅ Admin user exists:", adminUsers[0].email)
    }

    // Verify environment variables
    console.log("Checking environment variables...")
    const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "NODE_ENV"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      console.log("❌ Missing environment variables:", missingEnvVars)
      return false
    }

    console.log("✅ All environment variables present")

    // Test JWT functionality
    console.log("Testing JWT functionality...")
    const { generateToken, verifyToken } = await import("../lib/auth.js")
    const testToken = generateToken({ id: 1, email: "test@test.com", role: "teacher" })
    const decoded = verifyToken(testToken)

    if (decoded && decoded.email === "test@test.com") {
      console.log("✅ JWT functionality working")
    } else {
      console.log("❌ JWT functionality failed")
      return false
    }

    console.log("\n🎉 Railway Production Setup Complete!")
    console.log("\n📋 Next Steps:")
    console.log("1. Update admin password via the web interface")
    console.log("2. Import your users and courses data")
    console.log("3. Test the application thoroughly")
    console.log("4. Set up monitoring and backups")

    return true
  } catch (error) {
    console.error("❌ Railway setup failed:", error)
    return false
  }
}

// Run setup
setupRailwayProduction()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("Setup script error:", error)
    process.exit(1)
  })
