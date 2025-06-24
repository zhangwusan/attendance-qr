import { type NextRequest, NextResponse } from "next/server"
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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: result[0],
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
