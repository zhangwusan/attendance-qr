import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { getPool } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    const { userId } = await params

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const pool = getPool()

    const result = await pool.query("UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      hashedPassword,
      userId,
    ])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
