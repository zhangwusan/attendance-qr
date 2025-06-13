import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateQRCode } from "@/lib/qr-utils"

export async function POST(request: NextRequest) {
  try {
    const { courseId, teacherId } = await request.json()

    // Generate QR code and set expiration (10 minutes from now)
    const qrCode = generateQRCode(Date.now(), teacherId)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    const sessionDate = new Date().toISOString().split("T")[0]
    const sessionTime = new Date().toTimeString().split(" ")[0]

    // Deactivate any existing active sessions for this course
    await sql`
      UPDATE sessions 
      SET is_active = false 
      WHERE course_id = ${courseId} AND is_active = true
    `

    // Create new session
    const sessions = await sql`
      INSERT INTO sessions (course_id, teacher_id, qr_code, qr_expires_at, session_date, session_time)
      VALUES (${courseId}, ${teacherId}, ${qrCode}, ${expiresAt.toISOString()}, ${sessionDate}, ${sessionTime})
      RETURNING *
    `

    return NextResponse.json({ session: sessions[0] })
  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
