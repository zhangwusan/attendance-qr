import { NextResponse } from "next/server"
import { getPool, initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    // Initialize database if needed
    await initializeDatabase()

    // Test database connection
    const pool = getPool()
    const result = await pool.query("SELECT NOW() as current_time")

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: result.rows[0].current_time,
      message: "Attendance QR System is running",
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
