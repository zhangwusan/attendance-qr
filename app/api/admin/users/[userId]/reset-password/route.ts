import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const userId = Number.parseInt(params.userId)

    // Get user to determine default password
    const targetUser = await sql`
      SELECT role FROM users WHERE id = ${userId}
    `

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const defaultPassword = targetUser[0].role === "teacher" ? "teacher123" : "student123"
    const hashedPassword = await hashPassword(defaultPassword)

    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      defaultPassword,
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
