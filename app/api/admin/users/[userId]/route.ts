import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getPool } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    const { userId } = await params

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const pool = getPool()
    const result = await pool.query("SELECT id, email, name, role, student_id, created_at FROM users WHERE id = $1", [
      userId,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    const { userId } = await params

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, role, student_id } = await request.json()
    const pool = getPool()

    const result = await pool.query(
      `UPDATE users SET name = $1, role = $2, student_id = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, email, name, role, student_id, updated_at`,
      [name, role, student_id || null, userId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    const { userId } = await params

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const pool = getPool()
    const result = await pool.query("DELETE FROM users WHERE id = $1", [userId])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
