import { Pool } from "pg"

// Database connection
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required")
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

// Constants for the application
export const TIME_SLOTS = [
  { value: "07:00-09:00", label: "7:00 AM - 9:00 AM" },
  { value: "09:00-11:00", label: "9:00 AM - 11:00 AM" },
  { value: "13:00-15:00", label: "1:00 PM - 3:00 PM" },
  { value: "15:00-17:00", label: "3:00 PM - 5:00 PM" },
]

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export const QR_DURATIONS = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
]

// Database initialization
export async function initializeDatabase() {
  const pool = getPool()

  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
        student_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) NOT NULL,
        description TEXT,
        teacher_id INTEGER REFERENCES users(id),
        time_slot VARCHAR(100),
        days_of_week TEXT[],
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        student_id INTEGER REFERENCES users(id),
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, student_id)
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_sessions (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        teacher_id INTEGER REFERENCES users(id),
        session_name VARCHAR(255),
        qr_code VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES attendance_sessions(id),
        student_id INTEGER REFERENCES users(id),
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, student_id)
      )
    `)

    // Create default users if they don't exist
    const bcrypt = require("bcryptjs")

    const defaultUsers = [
      {
        email: "admin@ams.edu",
        password: await bcrypt.hash("admin123", 12),
        name: "System Administrator",
        role: "admin",
      },
      {
        email: "teacher@ams.edu",
        password: await bcrypt.hash("teacher123", 12),
        name: "Demo Teacher",
        role: "teacher",
      },
      {
        email: "student@ams.edu",
        password: await bcrypt.hash("student123", 12),
        name: "Demo Student",
        role: "student",
        student_id: "STU001",
      },
    ]

    for (const user of defaultUsers) {
      const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [user.email])
      if (existingUser.rows.length === 0) {
        await pool.query("INSERT INTO users (email, password, name, role, student_id) VALUES ($1, $2, $3, $4, $5)", [
          user.email,
          user.password,
          user.name,
          user.role,
          user.student_id || null,
        ])
      }
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

// Auto-initialize database on import
if (process.env.NODE_ENV === "production" || process.env.AUTO_INIT_DB === "true") {
  initializeDatabase().catch(console.error)
}
