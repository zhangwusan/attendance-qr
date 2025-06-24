import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyPassword, createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 })
    }

    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 })
    }

    // Find user by email and role (or admin role)
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${email.toLowerCase()} 
      AND (role = ${role} OR role = 'admin')
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      student_id: user.student_id,
      employee_id: user.employee_id,
      department: user.department,
      program: user.program,
      year_level: user.year_level,
      is_admin: user.is_admin,
    })

    // Set cookie and return user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        student_id: user.student_id,
        employee_id: user.employee_id,
        is_admin: user.is_admin,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
