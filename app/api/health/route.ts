import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
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
      },
      { status: 500 },
    )
  }
}
