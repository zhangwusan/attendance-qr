import { type NextRequest, NextResponse } from "next/server"
import { BulkImporter } from "@/lib/bulk-import"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const format = formData.get("format") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const content = await file.text()
    const importer = new BulkImporter()

    let teachers
    if (format === "csv") {
      const csvData = importer.parseCSV(content)
      teachers = importer.csvToTeachers(csvData)
    } else if (format === "json") {
      teachers = JSON.parse(content)
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }

    const result = await importer.importTeachers(teachers)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Teacher import error:", error)
    return NextResponse.json(
      {
        error: "Import failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
