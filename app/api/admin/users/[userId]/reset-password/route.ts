import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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
    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user exists
    const targetUser = await sql`
      SELECT id, role FROM users WHERE id = ${userIdNum}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update the password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE id = ${userIdNum}
    `

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
