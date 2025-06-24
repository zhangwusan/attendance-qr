import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamic import to handle potential module resolution issues
    const { sql } = await import("@/lib/db")

    if (!sql) {
      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "not_configured",
        version: "1.0.0",
        message: "Database not configured - running in development mode",
      })
    }

    // Test database connection
    await sql`SELECT 1`

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      version: "1.0.0",
    })
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        version: "1.0.0",
      },
      { status: 500 },
    )
  }
}
