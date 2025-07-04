<<<<<<< HEAD
import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
=======
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
>>>>>>> e27b8ad (fixed code)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

<<<<<<< HEAD
    return NextResponse.json({
      user: {
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
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
=======
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get current user error:", error)
>>>>>>> e27b8ad (fixed code)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
