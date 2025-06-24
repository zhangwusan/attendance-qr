import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check if database is available
    if (!sql) {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: "Database connection not available",
          database: {
            connected: false,
          },
        },
        { status: 503 },
      )
    }

    // Test database connection
    const result = await sql`SELECT 1 as test`

    // Check environment variables
    const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "NODE_ENV"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        query_test: result[0]?.test === 1,
      },
      environment_variables: {
        all_present: missingEnvVars.length === 0,
        missing: missingEnvVars,
      },
      railway: {
        deployment_id: process.env.RAILWAY_DEPLOYMENT_ID || "unknown",
        service_id: process.env.RAILWAY_SERVICE_ID || "unknown",
        environment_id: process.env.RAILWAY_ENVIRONMENT_ID || "unknown",
      },
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        database: {
          connected: false,
        },
      },
      { status: 503 },
    )
  }
}
