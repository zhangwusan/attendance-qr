import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const teacherId = request.nextUrl.searchParams.get("teacherId")

    let courses
    if (teacherId) {
      courses = await sql`
        SELECT * FROM courses 
        WHERE teacher_id = ${Number.parseInt(teacherId)}
        ORDER BY name
      `
    } else {
      courses = await sql`
        SELECT c.*, u.name as teacher_name 
        FROM courses c
        JOIN users u ON c.teacher_id = u.id
        ORDER BY c.name
      `
    }

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Get courses error:", error)
    return NextResponse.json({ error: "Failed to get courses" }, { status: 500 })
  }
}
