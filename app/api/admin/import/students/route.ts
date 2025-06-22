import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file must have header and at least one data row" }, { status: 400 })
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const dataLines = lines.slice(1)

    let imported = 0
    const errors: string[] = []

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = dataLines[i].split(",").map((v) => v.trim())
        const row: any = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        // Validate required fields
        if (!row.email || !row.name || !row.student_id) {
          errors.push(`Row ${i + 2}: Email, name, and student_id are required`)
          continue
        }

        // Check if email already exists
        const existingEmail = await sql`
          SELECT id FROM users WHERE email = ${row.email.toLowerCase()}
        `

        if (existingEmail.length > 0) {
          errors.push(`Row ${i + 2}: Email ${row.email} already exists`)
          continue
        }

        // Check if student_id already exists
        const existingStudentId = await sql`
          SELECT id FROM users WHERE student_id = ${row.student_id}
        `

        if (existingStudentId.length > 0) {
          errors.push(`Row ${i + 2}: Student ID ${row.student_id} already exists`)
          continue
        }

        // Set default password if not provided
        const password = row.password || "student123"
        const hashedPassword = await hashPassword(password)

        // Insert student
        await sql`
          INSERT INTO users (
            email, password_hash, name, role, student_id, program, year_level, phone, created_at
          )
          VALUES (
            ${row.email.toLowerCase()}, ${hashedPassword}, ${row.name}, 'student',
            ${row.student_id}, ${row.program || null}, ${Number.parseInt(row.year_level) || null}, 
            ${row.phone || null}, NOW()
          )
        `

        imported++
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
      message: `Import completed. ${imported} students imported successfully.`,
    })
  } catch (error) {
    console.error("Import students error:", error)
    return NextResponse.json({ error: "Failed to import students" }, { status: 500 })
  }
}
