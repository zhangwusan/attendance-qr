// Railway Database Migration Script
import { sql } from "../lib/db.js"

const migrations = [
  {
    name: "001-create-tables",
    file: "scripts/001-create-tables.sql",
  },
  {
    name: "002-seed-data",
    file: "scripts/002-seed-data.sql",
  },
  {
    name: "003-bulk-import-setup",
    file: "scripts/003-bulk-import-setup.sql",
  },
  {
    name: "004-add-admin-role",
    file: "scripts/004-add-admin-role.sql",
  },
]

async function runMigrations() {
  console.log("🚂 Running Railway Database Migrations...")

  try {
    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Check which migrations have been run
    const executedMigrations = await sql`
      SELECT name FROM migrations
    `
    const executedNames = executedMigrations.map((m) => m.name)

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedNames.includes(migration.name)) {
        console.log(`Running migration: ${migration.name}`)

        try {
          // Read and execute migration file
          const fs = await import("fs/promises")
          const migrationSQL = await fs.readFile(migration.file, "utf8")

          // Execute migration
          await sql.unsafe(migrationSQL)

          // Record migration as executed
          await sql`
            INSERT INTO migrations (name) VALUES (${migration.name})
          `

          console.log(`✅ Migration ${migration.name} completed`)
        } catch (error) {
          console.error(`❌ Migration ${migration.name} failed:`, error)
          throw error
        }
      } else {
        console.log(`⏭️  Migration ${migration.name} already executed`)
      }
    }

    console.log("✅ All migrations completed successfully")
    return true
  } catch (error) {
    console.error("❌ Migration failed:", error)
    return false
  }
}

// Run migrations
runMigrations()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error("Migration script error:", error)
    process.exit(1)
  })
