import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Check if we're in build mode (no database available)
    if (!sql) {
      return NextResponse.json({
        users: { total_users: 0, total_teachers: 0, total_students: 0, new_users_week: 0 },
        courses: { total_courses: 0 },
        sessions: { total_sessions: 0, sessions_today: 0, active_sessions: 0 },
        attendance: { total_attendance: 0, attendance_today: 0 },
      })
    }

    // Get user statistics
    const userStats = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as total_teachers,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week
      FROM users
    `

    // Get course statistics
    const courseStats = await sql`
      SELECT COUNT(*) as total_courses
      FROM courses
    `

    // Get session statistics
    const sessionStats = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN session_date = CURRENT_DATE THEN 1 END) as sessions_today,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions
      FROM sessions
    `

    // Get attendance statistics
    const attendanceStats = await sql`
      SELECT 
        COUNT(*) as total_attendance,
        COUNT(CASE WHEN DATE(scanned_at) = CURRENT_DATE THEN 1 END) as attendance_today
      FROM attendance
    `

    return NextResponse.json({
      users: userStats[0],
      courses: courseStats[0],
      sessions: sessionStats[0],
      attendance: attendanceStats[0],
    })
  } catch (error) {
    console.error("Get admin stats error:", error)

    // Return default values if database is not available (during build)
    return NextResponse.json({
      users: { total_users: 0, total_teachers: 0, total_students: 0, new_users_week: 0 },
      courses: { total_courses: 0 },
      sessions: { total_sessions: 0, sessions_today: 0, active_sessions: 0 },
      attendance: { total_attendance: 0, attendance_today: 0 },
    })
  }
}
