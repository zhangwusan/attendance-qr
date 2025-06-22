import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const userId = Number.parseInt(params.userId)
    const data = await request.json()
    const { email, name, password, role, student_id, employee_id, department, program, year_level, phone } = data

    // Build update query dynamically
    const updateFields = []
    const values = []

    if (email) {
      updateFields.push(`email = $${updateFields.length + 1}`)
      values.push(email.toLowerCase())
    }
    if (name) {
      updateFields.push(`name = $${updateFields.length + 1}`)
      values.push(name)
    }
    if (password) {
      const hashedPassword = await hashPassword(password)
      updateFields.push(`password_hash = $${updateFields.length + 1}`)
      values.push(hashedPassword)
    }
    if (role) {
      updateFields.push(`role = $${updateFields.length + 1}`)
      values.push(role)
    }
    if (student_id !== undefined) {
      updateFields.push(`student_id = $${updateFields.length + 1}`)
      values.push(student_id || null)
    }
    if (employee_id !== undefined) {
      updateFields.push(`employee_id = $${updateFields.length + 1}`)
      values.push(employee_id || null)
    }
    if (department !== undefined) {
      updateFields.push(`department = $${updateFields.length + 1}`)
      values.push(department || null)
    }
    if (program !== undefined) {
      updateFields.push(`program = $${updateFields.length + 1}`)
      values.push(program || null)
    }
    if (year_level !== undefined) {
      updateFields.push(`year_level = $${updateFields.length + 1}`)
      values.push(year_level || null)
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${updateFields.length + 1}`)
      values.push(phone || null)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Add userId to values
    values.push(userId)

    const result = await sql`
      UPDATE users 
      SET ${sql.unsafe(updateFields.join(", "))}
      WHERE id = $${values.length}
      RETURNING id, email, name, role, student_id, employee_id, department, program, year_level, phone, created_at
    `

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

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const userId = Number.parseInt(params.userId)

    // Don't allow deleting self
    if (user.id === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM users WHERE id = ${userId}
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
