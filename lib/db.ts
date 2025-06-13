import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

export type User = {
  id: number
  email: string
  name: string
  role: "teacher" | "student"
  student_id?: string
}

export type Course = {
  id: number
  name: string
  code: string
  teacher_id: number
  room: string
}

export type Session = {
  id: number
  course_id: number
  teacher_id: number
  qr_code: string
  qr_expires_at: string
  session_date: string
  session_time: string
  is_active: boolean
  course?: Course
}

export type AttendanceRecord = {
  id: number
  session_id: number
  student_id: number
  scanned_at: string
  student?: User
}
