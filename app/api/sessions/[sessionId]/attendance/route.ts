import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = Number.parseInt(params.sessionId)

    const attendance = await sql`
      SELECT a.*, u.name, u.student_id, u.email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.session_id = ${sessionId}
      ORDER BY a.scanned_at DESC
    `

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Get attendance error:", error)
    return NextResponse.json({ error: "Failed to get attendance" }, { status: 500 })
  }
}
