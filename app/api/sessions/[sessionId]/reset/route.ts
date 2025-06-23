import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const sessionId = Number.parseInt(params.sessionId)
    const { action } = await request.json()

    // Verify session belongs to teacher
    const session = await sql`
      SELECT id, qr_duration FROM sessions 
      WHERE id = ${sessionId} AND teacher_id = ${user.id}
    `

    if (session.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (action === "expire") {
      await sql`
        UPDATE sessions 
        SET manually_expired = true, is_active = false 
        WHERE id = ${sessionId}
      `
      return NextResponse.json({ success: true, message: "Session expired successfully" })
    } else if (action === "reactivate") {
      const newExpiry = new Date(Date.now() + session[0].qr_duration * 60 * 1000)

      await sql`
        UPDATE sessions 
        SET manually_expired = false, is_active = true, qr_expires_at = ${newExpiry.toISOString()}
        WHERE id = ${sessionId}
      `

      return NextResponse.json({
        success: true,
        message: "Session reactivated successfully",
        newExpiryTime: newExpiry.toISOString(),
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Reset session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
