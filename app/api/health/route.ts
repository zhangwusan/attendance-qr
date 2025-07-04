import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
<<<<<<< HEAD
    let dbStatus = "disconnected"
    let dbError = null

    if (sql) {
      try {
        await sql`SELECT 1`
        dbStatus = "connected"
      } catch (error) {
        dbStatus = "error"
        dbError = error instanceof Error ? error.message : "Unknown database error"
      }
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        error: dbError,
      },
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
=======
    // Test database connection
    const result = await sql`SELECT 1 as test`

    // Check if users table exists and has data
    const userCount = await sql`SELECT COUNT(*) as count FROM users`

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      users: userCount[0].count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
>>>>>>> e27b8ad (fixed code)
      },
      { status: 500 },
    )
  }
}
