import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { getPool } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const pool = getPool()
    const result = await pool.query(`
      SELECT id, email, name, role, student_id, created_at 
      FROM users 
      ORDER BY created_at DESC
    `)

    return NextResponse.json({ users: result.rows })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { email, password, name, role, student_id } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const pool = getPool()

    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, student_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, role, student_id, created_at`,
      [email, hashedPassword, name, role, student_id || null],
    )

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
