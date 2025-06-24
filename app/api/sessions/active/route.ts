import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const sessions = await sql`
      SELECT s.id, s.qr_code, s.qr_expires_at, s.qr_duration, s.is_active, s.manually_expired,
             c.name as course_name, c.code as course_code, c.room
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      WHERE s.teacher_id = ${user.id} 
        AND s.is_active = true 
        AND s.manually_expired = false
        AND s.qr_expires_at > CURRENT_TIMESTAMP
      ORDER BY s.created_at DESC
    `

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Get active sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
