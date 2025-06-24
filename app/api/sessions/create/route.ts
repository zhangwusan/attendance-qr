import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { sql } from "@/lib/db"
import { generateQRCode, generateQRCodeData } from "@/lib/qr-utils"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { courseId, qrDuration } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Verify course belongs to teacher
    const course = await sql`
      SELECT id, name, room, time_slot FROM courses 
      WHERE id = ${courseId} AND teacher_id = ${user.id}
    `

    if (course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Deactivate existing sessions for this course
    await sql`
      UPDATE sessions 
      SET is_active = false 
      WHERE course_id = ${courseId} AND is_active = true
    `

    // Create new session
    const qrCode = generateQRCodeData()
    const duration = qrDuration || 10
    const expiresAt = new Date(Date.now() + duration * 60 * 1000)

    const sessionResult = await sql`
      INSERT INTO sessions (
        course_id, teacher_id, qr_code, qr_expires_at, qr_duration,
        session_date, session_time, is_active, manually_expired
      )
      VALUES (
        ${courseId}, ${user.id}, ${qrCode}, ${expiresAt.toISOString()}, ${duration},
        CURRENT_DATE, CURRENT_TIME, true, false
      )
      RETURNING id, qr_code, qr_expires_at, qr_duration
    `

    const session = sessionResult[0]
    const qrImage = await generateQRCode(session.qr_code)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        qr_code: session.qr_code,
        qr_image: qrImage,
        expires_at: session.qr_expires_at,
        qr_duration: session.qr_duration,
        course: course[0],
      },
    })
  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
