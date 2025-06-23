import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const courseId = Number.parseInt(params.courseId)
    const { name, code, room, timeSlot, daysOfWeek, defaultQrDuration } = await request.json()

    if (!name || !code || !room || !timeSlot || !daysOfWeek) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if course exists and belongs to teacher
    const course = await sql`
      SELECT id FROM courses 
      WHERE id = ${courseId} AND teacher_id = ${user.id}
    `

    if (course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if new code conflicts with existing courses
    const existing = await sql`
      SELECT id FROM courses 
      WHERE code = ${code.toUpperCase()} AND teacher_id = ${user.id} AND id != ${courseId}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Course code already exists" }, { status: 400 })
    }

    const result = await sql`
      UPDATE courses 
      SET name = ${name}, code = ${code.toUpperCase()}, room = ${room}, 
          time_slot = ${timeSlot}, days_of_week = ${daysOfWeek.join(",")}, 
          default_qr_duration = ${defaultQrDuration || 10}
      WHERE id = ${courseId} AND teacher_id = ${user.id}
      RETURNING id, name, code, room, time_slot, days_of_week, default_qr_duration, created_at
    `

    return NextResponse.json({ success: true, course: result[0] })
  } catch (error) {
    console.error("Update course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const courseId = Number.parseInt(params.courseId)

    // Check if course exists and belongs to teacher
    const course = await sql`
      SELECT id FROM courses 
      WHERE id = ${courseId} AND teacher_id = ${user.id}
    `

    if (course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    await sql`
      DELETE FROM courses 
      WHERE id = ${courseId} AND teacher_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
