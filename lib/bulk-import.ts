import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export interface ImportUser {
  email: string
  name: string
  role: "teacher" | "student"
  student_id?: string
  employee_id?: string
  department?: string
  program?: string
  year_level?: number
  phone?: string
}

export interface ImportCourse {
  name: string
  code: string
  teacher_email: string
  room?: string
  time_slot: string
  days_of_week: string[]
  default_qr_duration?: number
}

export class BulkImporter {
  parseCSV(content: string): string[][] {
    const lines = content.trim().split("\n")
    return lines.map((line) => {
      // Simple CSV parsing - handles basic cases
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }

      result.push(current.trim())
      return result
    })
  }

  csvToTeachers(csvData: string[][]): ImportUser[] {
    const [headers, ...rows] = csvData
    return rows.map((row) => {
      const teacher: ImportUser = {
        email: row[0] || "",
        name: row[1] || "",
        role: "teacher" as const,
        employee_id: row[2] || undefined,
        department: row[3] || undefined,
        phone: row[4] || undefined,
      }
      return teacher
    })
  }

  csvToStudents(csvData: string[][]): ImportUser[] {
    const [headers, ...rows] = csvData
    return rows.map((row) => {
      const student: ImportUser = {
        email: row[0] || "",
        name: row[1] || "",
        role: "student" as const,
        student_id: row[2] || undefined,
        program: row[3] || undefined,
        year_level: row[4] ? Number.parseInt(row[4]) : undefined,
        phone: row[5] || undefined,
      }
      return student
    })
  }

  csvToCourses(csvData: string[][]): ImportCourse[] {
    const [headers, ...rows] = csvData
    return rows.map((row) => {
      const course: ImportCourse = {
        name: row[0] || "",
        code: row[1] || "",
        teacher_email: row[2] || "",
        room: row[3] || undefined,
        time_slot: row[4] || "",
        days_of_week: row[5] ? row[5].split(",").map((d) => d.trim()) : [],
        default_qr_duration: row[6] ? Number.parseInt(row[6]) : 10,
      }
      return course
    })
  }

  async importTeachers(teachers: ImportUser[]) {
    if (!sql) {
      throw new Error("Database not available")
    }

    const results = {
      success: 0,
      errors: [] as string[],
      created: [] as any[],
    }

    for (const teacher of teachers) {
      try {
        // Check if email already exists
        const existing = await sql`
          SELECT id FROM users WHERE email = ${teacher.email.toLowerCase()}
        `

        if (existing.length > 0) {
          results.errors.push(`Teacher ${teacher.email} already exists`)
          continue
        }

        // Default password for imported teachers
        const defaultPassword = "teacher123"
        const hashedPassword = await hashPassword(defaultPassword)

        const result = await sql`
          INSERT INTO users (
            email, password_hash, name, role, employee_id, department, phone, created_at
          )
          VALUES (
            ${teacher.email.toLowerCase()}, ${hashedPassword}, ${teacher.name}, 'teacher',
            ${teacher.employee_id || null}, ${teacher.department || null}, 
            ${teacher.phone || null}, NOW()
          )
          RETURNING id, email, name, role, employee_id, department
        `

        results.created.push(result[0])
        results.success++
      } catch (error) {
        results.errors.push(
          `Failed to import teacher ${teacher.email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }

    return results
  }

  async importStudents(students: ImportUser[]) {
    if (!sql) {
      throw new Error("Database not available")
    }

    const results = {
      success: 0,
      errors: [] as string[],
      created: [] as any[],
    }

    for (const student of students) {
      try {
        // Check if email already exists
        const existing = await sql`
          SELECT id FROM users WHERE email = ${student.email.toLowerCase()}
        `

        if (existing.length > 0) {
          results.errors.push(`Student ${student.email} already exists`)
          continue
        }

        // Check if student_id already exists
        if (student.student_id) {
          const existingStudentId = await sql`
            SELECT id FROM users WHERE student_id = ${student.student_id}
          `

          if (existingStudentId.length > 0) {
            results.errors.push(`Student ID ${student.student_id} already exists`)
            continue
          }
        }

        // Default password for imported students
        const defaultPassword = "student123"
        const hashedPassword = await hashPassword(defaultPassword)

        const result = await sql`
          INSERT INTO users (
            email, password_hash, name, role, student_id, program, year_level, phone, created_at
          )
          VALUES (
            ${student.email.toLowerCase()}, ${hashedPassword}, ${student.name}, 'student',
            ${student.student_id || null}, ${student.program || null}, 
            ${student.year_level || null}, ${student.phone || null}, NOW()
          )
          RETURNING id, email, name, role, student_id, program, year_level
        `

        results.created.push(result[0])
        results.success++
      } catch (error) {
        results.errors.push(
          `Failed to import student ${student.email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }

    return results
  }

  async importCourses(courses: ImportCourse[]) {
    if (!sql) {
      throw new Error("Database not available")
    }

    const results = {
      success: 0,
      errors: [] as string[],
      created: [] as any[],
    }

    for (const course of courses) {
      try {
        // Find teacher by email
        const teacher = await sql`
          SELECT id FROM users WHERE email = ${course.teacher_email.toLowerCase()} AND role = 'teacher'
        `

        if (teacher.length === 0) {
          results.errors.push(`Teacher ${course.teacher_email} not found`)
          continue
        }

        const teacherId = teacher[0].id

        // Check if course code already exists for this teacher
        const existing = await sql`
          SELECT id FROM courses WHERE code = ${course.code.toUpperCase()} AND teacher_id = ${teacherId}
        `

        if (existing.length > 0) {
          results.errors.push(`Course ${course.code} already exists for teacher ${course.teacher_email}`)
          continue
        }

        const result = await sql`
          INSERT INTO courses (
            name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration, created_at
          )
          VALUES (
            ${course.name}, ${course.code.toUpperCase()}, ${teacherId}, ${course.room || null},
            ${course.time_slot}, ${course.days_of_week.join(",")}, ${course.default_qr_duration || 10}, NOW()
          )
          RETURNING id, name, code, room, time_slot, days_of_week, default_qr_duration
        `

        results.created.push(result[0])
        results.success++
      } catch (error) {
        results.errors.push(
          `Failed to import course ${course.code}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }

    return results
  }
}
