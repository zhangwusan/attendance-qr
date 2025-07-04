import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { userId } = await params
    const userIdNum = Number.parseInt(userId)
    const data = await request.json()
    const { email, name, password, role, student_id, employee_id, department, program, year_level, phone } = data

    // Build update fields using template literals
    let result

    if (email && name && !password) {
      result = await sql`
        UPDATE users 
        SET email = ${email.toLowerCase()}, name = ${name}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (email && password && !name) {
      const hashedPassword = await hashPassword(password)
      result = await sql`
        UPDATE users 
        SET email = ${email.toLowerCase()}, password_hash = ${hashedPassword}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (name && password && !email) {
      const hashedPassword = await hashPassword(password)
      result = await sql`
        UPDATE users 
        SET name = ${name}, password_hash = ${hashedPassword}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (email && name && password) {
      const hashedPassword = await hashPassword(password)
      result = await sql`
        UPDATE users 
        SET email = ${email.toLowerCase()}, name = ${name}, password_hash = ${hashedPassword}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (email) {
      result = await sql`
        UPDATE users 
        SET email = ${email.toLowerCase()}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (name) {
      result = await sql`
        UPDATE users 
        SET name = ${name}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (password) {
      const hashedPassword = await hashPassword(password)
      result = await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (role) {
      result = await sql`
        UPDATE users 
        SET role = ${role}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (student_id !== undefined) {
      result = await sql`
        UPDATE users 
        SET student_id = ${student_id || null}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (employee_id !== undefined) {
      result = await sql`
        UPDATE users 
        SET employee_id = ${employee_id || null}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (department !== undefined) {
      result = await sql`
        UPDATE users 
        SET department = ${department || null}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (program !== undefined) {
      result = await sql`
        UPDATE users 
        SET program = ${program || null}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (year_level !== undefined) {
      result = await sql`
        UPDATE users 
        SET year_level = ${year_level || null}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else if (phone !== undefined) {
      result = await sql`
        UPDATE users 
        SET phone = ${phone || null}
        WHERE id = ${userIdNum}
        RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
      `
    } else {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    if (result.length === 0) {
=======
import { sql } from "@/lib/db"
import { getUserFromRequest, isAdmin } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const user = await getUserFromRequest(request)

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const users = await sql`
      SELECT id, email, name, role, student_id, employee_id, department, program, year_level, is_admin, created_at
      FROM users 
      WHERE id = ${Number.parseInt(userId)}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const user = await getUserFromRequest(request)

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, role, student_id, employee_id, department, program, year_level } = await request.json()

    const updatedUsers = await sql`
      UPDATE users 
      SET name = ${name}, role = ${role}, student_id = ${student_id || null}, 
          employee_id = ${employee_id || null}, department = ${department || null}, 
          program = ${program || null}, year_level = ${year_level || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number.parseInt(userId)}
      RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, is_admin, created_at
    `

    if (updatedUsers.length === 0) {
>>>>>>> e27b8ad (fixed code)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
<<<<<<< HEAD
      success: true,
      message: "User updated successfully",
      user: result[0],
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
=======
      user: updatedUsers[0],
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
>>>>>>> e27b8ad (fixed code)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
<<<<<<< HEAD
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    if (!sql) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { userId } = await params
    const userIdNum = Number.parseInt(userId)

    // Don't allow deleting self
    if (user.id === userIdNum) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM users WHERE id = ${userIdNum}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
=======
    const { userId } = await params
    const user = await getUserFromRequest(request)

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await sql`DELETE FROM users WHERE id = ${Number.parseInt(userId)}`

    return NextResponse.json({
>>>>>>> e27b8ad (fixed code)
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
<<<<<<< HEAD
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
=======
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
>>>>>>> e27b8ad (fixed code)
  }
}
