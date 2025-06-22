import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { generateQRCode } from "@/lib/qr-utils"

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const sessions = await sql`
      SELECT s.id, s.qr_code, s.qr_expires_at, s.qr_duration, s.manually_expired,
             c.name as course_name, c.room, c.time_slot
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      WHERE s.teacher_id = ${user.id} 
        AND s.is_active = true 
        AND s.manually_expired = false
        AND s.qr_expires_at > CURRENT_TIMESTAMP
      ORDER BY s.created_at DESC
      LIMIT 1
    `

    if (sessions.length === 0) {
      return NextResponse.json({ session: null })
    }

    const session = sessions[0]
    const qrImage = await generateQRCode(session.qr_code)

    return NextResponse.json({
      session: {
        id: session.id,
        qr_code: session.qr_code,
        qr_image: qrImage,
        expires_at: session.qr_expires_at,
        qr_duration: session.qr_duration,
        course_name: session.course_name,
        room: session.room,
        time_slot: session.time_slot,
      },
    })
  } catch (error) {
    console.error("Get active session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
