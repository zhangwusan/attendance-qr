import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { getPool } from "./db"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "teacher" | "student"
  student_id?: string
}

export function createToken(user: User): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required")
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    student_id: user.student_id,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  }

  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function verifyToken(token: string): User | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      student_id: payload.student_id,
    }
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  return verifyToken(token)
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  return verifyToken(token)
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const pool = getPool()

  try {
    const result = await pool.query("SELECT id, email, password, name, role, student_id FROM users WHERE email = $1", [
      email,
    ])

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      student_id: user.student_id,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
