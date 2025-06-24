import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is available (not during build)
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL environment variable is not set")
}

// Export sql as null if no database URL is provided
export const sql = databaseUrl ? neon(databaseUrl) : null

// Database initialization with better error handling
export async function initializeDatabase() {
  if (!sql) {
    console.log("Database not available - skipping initialization")
    return false
  }

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
        student_id VARCHAR(50) UNIQUE,
        employee_id VARCHAR(50) UNIQUE,
        department VARCHAR(100),
        phone VARCHAR(20),
        program VARCHAR(100),
        year_level INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create courses table
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        room VARCHAR(100),
        time_slot VARCHAR(50) NOT NULL,
        days_of_week TEXT NOT NULL,
        default_qr_duration INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(code, teacher_id)
      )
    `

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        qr_code VARCHAR(500) UNIQUE NOT NULL,
        qr_expires_at TIMESTAMP NOT NULL,
        qr_duration INTEGER NOT NULL DEFAULT 10,
        session_date DATE NOT NULL,
        session_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        manually_expired BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create attendance table
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50),
        user_agent TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location_accuracy DECIMAL(8, 2),
        UNIQUE(session_id, student_id)
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`
    await sql`CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active)`
    await sql`CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id)`

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Database initialization error:", error)
    return false
  }
}

// Seed initial data with better error handling
export async function seedDatabase() {
  if (!sql) {
    console.log("Database not available - skipping seeding")
    return false
  }

  try {
    // Check if users already exist
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`
    if (existingUsers[0].count > 0) {
      console.log("Database already seeded")
      return true
    }

    // Create demo admin
    await sql`
      INSERT INTO users (email, password_hash, name, role, employee_id, department)
      VALUES (
        'admin@ams.edu',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'System Administrator',
        'admin',
        'ADMIN001',
        'IT Department'
      )
    `

    // Create demo teacher
    const teacherResult = await sql`
      INSERT INTO users (email, password_hash, name, role, employee_id, department)
      VALUES (
        'teacher@ams.edu',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Dr. Demo Teacher',
        'teacher',
        'EMP001',
        'Computer Science'
      )
      RETURNING id
    `

    // Create demo student
    await sql`
      INSERT INTO users (email, password_hash, name, role, student_id, program, year_level)
      VALUES (
        'student@ams.edu',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Demo Student',
        'student',
        'STU001',
        'Computer Science',
        3
      )
    `

    // Create demo course
    await sql`
      INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
      VALUES (
        'Software Engineering',
        'CS301',
        ${teacherResult[0].id},
        'Room 203',
        '09:00-10:30',
        'Monday,Wednesday,Friday',
        15
      )
    `

    console.log("Database seeded successfully")
    console.log("Demo accounts:")
    console.log("Admin: admin@ams.edu / password")
    console.log("Teacher: teacher@ams.edu / password")
    console.log("Student: student@ams.edu / password")
    return true
  } catch (error) {
    console.error("Database seeding error:", error)
    return false
  }
}

// Constants for form options
export const TIME_SLOTS = [
  { value: "07:00-08:30", label: "7:00 AM - 8:30 AM" },
  { value: "08:30-10:00", label: "8:30 AM - 10:00 AM" },
  { value: "10:00-11:30", label: "10:00 AM - 11:30 AM" },
  { value: "11:30-13:00", label: "11:30 AM - 1:00 PM" },
  { value: "13:00-14:30", label: "1:00 PM - 2:30 PM" },
  { value: "14:30-16:00", label: "2:30 PM - 4:00 PM" },
  { value: "16:00-17:30", label: "4:00 PM - 5:30 PM" },
  { value: "17:30-19:00", label: "5:30 PM - 7:00 PM" },
]

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export const QR_DURATIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 20, label: "20 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
]
