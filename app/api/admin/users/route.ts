import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"
=======
import { sql } from "@/lib/db"
import { getUserFromRequest, hashPassword, isAdmin } from "@/lib/auth"
>>>>>>> e27b8ad (fixed code)

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

<<<<<<< HEAD
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const users = await sql`
      SELECT 
        id, email, name, role, student_id, employee_id, 
        department, program, year_level, phone, created_at
=======
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = await sql`
      SELECT id, email, name, role, student_id, employee_id, department, program, year_level, is_admin, created_at
>>>>>>> e27b8ad (fixed code)
      FROM users 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

<<<<<<< HEAD
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const data = await request.json()
    const { email, name, password, role, student_id, employee_id, department, program, year_level, phone } = data

    // Validation
    if (!email || !name || !role) {
      return NextResponse.json({ error: "Email, name, and role are required" }, { status: 400 })
    }

    if (role === "student" && !student_id) {
      return NextResponse.json({ error: "Student ID is required for students" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Check if student_id already exists (for students)
    if (role === "student" && student_id) {
      const existingStudent = await sql`
        SELECT id FROM users WHERE student_id = ${student_id}
      `

      if (existingStudent.length > 0) {
        return NextResponse.json({ error: "Student ID already exists" }, { status: 400 })
      }
    }

    // Check if employee_id already exists (for teachers)
    if (role === "teacher" && employee_id) {
      const existingEmployee = await sql`
        SELECT id FROM users WHERE employee_id = ${employee_id}
      `

      if (existingEmployee.length > 0) {
        return NextResponse.json({ error: "Employee ID already exists" }, { status: 400 })
      }
    }

    // Set default password if not provided
    const defaultPassword = role === "teacher" ? "teacher123" : "student123"
    const finalPassword = password || defaultPassword
    const hashedPassword = await hashPassword(finalPassword)

    // Insert user
    const result = await sql`
      INSERT INTO users (
        email, password_hash, name, role, student_id, employee_id,
        department, program, year_level, phone, created_at
      )
      VALUES (
        ${email.toLowerCase()}, ${hashedPassword}, ${name}, ${role},
        ${student_id || null}, ${employee_id || null},
        ${department || null}, ${program || null}, ${year_level || null},
        ${phone || null}, NOW()
      )
      RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
    `

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: result[0],
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
=======
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { email, password, name, role, student_id, employee_id, department, program, year_level } =
      await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Email, password, name, and role are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUsers = await sql`
      INSERT INTO users (email, password, name, role, student_id, employee_id, department, program, year_level)
      VALUES (${email.toLowerCase()}, ${hashedPassword}, ${name}, ${role}, ${student_id || null}, ${employee_id || null}, ${department || null}, ${program || null}, ${year_level || null})
      RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, is_admin, created_at
    `

    return NextResponse.json({
      user: newUsers[0],
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
>>>>>>> e27b8ad (fixed code)
  }
}
