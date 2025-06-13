import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { isQRExpired } from "@/lib/qr-utils"

export async function POST(request: NextRequest) {
  try {
    const { qrCode, studentId } = await request.json()

    // Find the session by QR code
    const sessions = await sql`
      SELECT * FROM sessions 
      WHERE qr_code = ${qrCode} AND is_active = true
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    const session = sessions[0]

    // Check if QR code has expired
    if (isQRExpired(session.qr_expires_at)) {
      return NextResponse.json({ error: "QR code has expired. Please contact your teacher." }, { status: 400 })
    }

    // Check if student already scanned for this session
    const existingAttendance = await sql`
      SELECT * FROM attendance 
      WHERE session_id = ${session.id} AND student_id = ${studentId}
    `

    if (existingAttendance.length > 0) {
      return NextResponse.json({ error: "You have already been marked present for this session" }, { status: 400 })
    }

    // Record attendance
    const attendance = await sql`
      INSERT INTO attendance (session_id, student_id, ip_address, user_agent)
      VALUES (${session.id}, ${studentId}, ${request.ip || "unknown"}, ${request.headers.get("user-agent") || "unknown"})
      RETURNING *
    `

    // Get student info
    const students = await sql`
      SELECT name, student_id FROM users WHERE id = ${studentId}
    `

    return NextResponse.json({
      success: true,
      message: `✅ Your attendance has been recorded – ${new Date().toLocaleTimeString()}`,
      student: students[0],
      scannedAt: attendance[0].scanned_at,
    })
  } catch (error) {
    console.error("Scan attendance error:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}
