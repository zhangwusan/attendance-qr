import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const courses = await sql`
      SELECT id, name, code, room, time_slot, days_of_week, default_qr_duration, created_at
      FROM courses 
      WHERE teacher_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Get courses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, code, room, timeSlot, daysOfWeek, defaultQrDuration } = await request.json()

    if (!name || !code || !room || !timeSlot || !daysOfWeek) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if course code already exists for this teacher
    const existing = await sql`
      SELECT id FROM courses 
      WHERE code = ${code.toUpperCase()} AND teacher_id = ${user.id}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Course code already exists" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
      VALUES (${name}, ${code.toUpperCase()}, ${user.id}, ${room}, ${timeSlot}, ${daysOfWeek.join(",")}, ${defaultQrDuration || 10})
      RETURNING id, name, code, room, time_slot, days_of_week, default_qr_duration, created_at
    `

    return NextResponse.json({ success: true, course: result[0] })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
