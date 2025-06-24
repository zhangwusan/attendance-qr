import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { qrCode, latitude, longitude, accuracy } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    // Find active session with this QR code
    const sessions = await sql`
      SELECT s.id, s.course_id, s.qr_expires_at, c.name as course_name, c.room
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      WHERE s.qr_code = ${qrCode} 
        AND s.is_active = true 
        AND s.manually_expired = false
        AND s.qr_expires_at > CURRENT_TIMESTAMP
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Invalid or expired QR code" }, { status: 400 })
    }

    const session = sessions[0]

    // Check if student already scanned for this session
    const existing = await sql`
      SELECT id FROM attendance 
      WHERE session_id = ${session.id} AND student_id = ${user.id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "You have already been marked present for this session" }, { status: 400 })
    }

    // Get IP address from headers
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwarded?.split(",")[0] || realIp || "unknown"

    // Record attendance
    const result = await sql`
      INSERT INTO attendance (
        session_id, student_id, scanned_at, latitude, longitude, location_accuracy,
        ip_address, user_agent
      )
      VALUES (
        ${session.id}, ${user.id}, CURRENT_TIMESTAMP, ${latitude || null}, ${longitude || null}, ${accuracy || null},
        ${ipAddress}, ${request.headers.get("user-agent") || "unknown"}
      )
      RETURNING id, scanned_at
    `

    return NextResponse.json({
      success: true,
      message: `✅ Your attendance has been recorded for ${session.course_name}`,
      scanned_at: result[0].scanned_at,
      course: {
        name: session.course_name,
        room: session.room,
      },
    })
  } catch (error) {
    console.error("Scan QR error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
