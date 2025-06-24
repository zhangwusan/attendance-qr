// Script to create test users for API testing
import { sql } from "../lib/db.js"
import { hashPassword } from "../lib/auth.js"

async function createTestUsers() {
  console.log("���� Creating test users for API testing...")

  try {
    // Create test teacher
    const teacherPassword = await hashPassword("teacher123")
    await sql`
      INSERT INTO users (email, password_hash, name, role, employee_id, created_at)
      VALUES ('teacher@test.com', ${teacherPassword}, 'Test Teacher', 'teacher', 'EMP001', NOW())
      ON CONFLICT (email) DO NOTHING
    `
    console.log("✅ Test teacher created/exists")

    // Create test student
    const studentPassword = await hashPassword("student123")
    await sql`
      INSERT INTO users (email, password_hash, name, role, student_id, created_at)
      VALUES ('student@test.com', ${studentPassword}, 'Test Student', 'student', 'STU001', NOW())
      ON CONFLICT (email) DO NOTHING
    `
    console.log("✅ Test student created/exists")

    console.log("✨ Test users setup complete!")
  } catch (error) {
    console.error("❌ Error creating test users:", error)
  }
}

createTestUsers()
