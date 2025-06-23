import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const sessionId = Number.parseInt(params.sessionId)

    // Verify session belongs to teacher
    const session = await sql`
      SELECT id FROM sessions 
      WHERE id = ${sessionId} AND teacher_id = ${user.id}
    `

    if (session.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const attendance = await sql`
      SELECT a.id, a.scanned_at, a.latitude, a.longitude, a.location_accuracy,
             u.name, u.student_id, u.email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.session_id = ${sessionId}
      ORDER BY a.scanned_at DESC
    `

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Get attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
