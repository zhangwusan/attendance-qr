import { NextResponse } from "next/server"
<<<<<<< HEAD

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    })

    return response
=======
import { clearAuthCookie } from "@/lib/auth"

export async function POST() {
  try {
    clearAuthCookie()

    return NextResponse.json({
      message: "Logout successful",
    })
>>>>>>> e27b8ad (fixed code)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
