import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
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
=======
import { sql } from "@/lib/db"
import { getUserFromRequest, hashPassword, isAdmin } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const user = await getUserFromRequest(request)

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

>>>>>>> e27b8ad (fixed code)
    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

<<<<<<< HEAD
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
=======
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    const updatedUsers = await sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number.parseInt(userId)}
      RETURNING id, email, name
    `

    if (updatedUsers.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
>>>>>>> e27b8ad (fixed code)
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
<<<<<<< HEAD
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
=======
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
>>>>>>> e27b8ad (fixed code)
  }
}
