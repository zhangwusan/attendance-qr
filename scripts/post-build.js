const { initializeDatabase, seedDatabase } = require("./init-db")

async function postBuild() {
  console.log("🚀 Running post-build setup...")

  try {
    // Initialize database
    await initializeDatabase()

    // Seed with initial data
    await seedDatabase()

    console.log("✅ Post-build setup completed successfully!")
  } catch (error) {
    console.error("❌ Post-build setup failed:", error)
    // Don't exit with error code to allow deployment to continue
    // process.exit(1)
  }
}

if (require.main === module) {
  postBuild()
}

module.exports = { postBuild }
