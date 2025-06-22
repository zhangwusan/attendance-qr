const { neon } = require("@neondatabase/serverless")
const bcrypt = require("bcryptjs")

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log("🌱 Seeding database...")

    // Check if data already exists
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`
    if (existingUsers[0].count > 0) {
      console.log("📊 Database already seeded")
      return
    }

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12)
    await sql`
      INSERT INTO users (email, password_hash, name, role, employee_id, department)
      VALUES ('admin@ams.edu', ${adminPassword}, 'System Administrator', 'teacher', 'ADMIN001', 'Administration')
    `

    // Create demo teacher
    const teacherPassword = await bcrypt.hash("teacher123", 12)
    const teacherResult = await sql`
      INSERT INTO users (email, password_hash, name, role, employee_id, department)
      VALUES ('lin.mongkolsery@ams.edu', ${teacherPassword}, 'Dr. LIN Mongkolsery', 'teacher', 'EMP001', 'Computer Science')
      RETURNING id
    `

    // Create demo student
    const studentPassword = await bcrypt.hash("student123", 12)
    await sql`
      INSERT INTO users (email, password_hash, name, role, student_id, program, year_level)
      VALUES ('e20211125@ams.edu', ${studentPassword}, 'AN HENGHENG', 'student', 'e20211125', 'Computer Science', 3)
    `

    // Create demo course with updated time slot
    await sql`
      INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
      VALUES ('Software Engineering', 'CS301', ${teacherResult[0].id}, 'Room 203', '09:00-11:00', 'Monday,Wednesday,Friday', 15)
    `

    console.log("✅ Database seeded successfully")
    console.log("📋 Demo accounts created:")
    console.log("   Admin: admin@ams.edu / admin123")
    console.log("   Teacher: lin.mongkolsery@ams.edu / teacher123")
    console.log("   Student: e20211125@ams.edu / student123")
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
