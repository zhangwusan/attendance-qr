import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

const secretKey = process.env.JWT_SECRET || "fallback-secret-key"
const key = new TextEncoder().encode(secretKey)

export interface User {
  id: number
  email: string
  name: string
  role: "teacher" | "student" | "admin"
  student_id?: string
  employee_id?: string
  department?: string
  program?: string
  year_level?: number
  is_admin?: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(user: User): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_admin: user.is_admin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, key)

    // Validate that the payload has the required User properties
    if (
      typeof payload.id === "number" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      typeof payload.role === "string" &&
      ["teacher", "student", "admin"].includes(payload.role as string)
    ) {
      return payload as unknown as User
    }

    return null
  } catch (error) {
    return null
  }
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  return verifyToken(token)
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get("auth-token")?.value

  if (!token) return null

  return verifyToken(token)
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

// Helper function to check if user has admin privileges
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin" || user?.is_admin === true
}

// Helper function to check if user can access admin features
export function canAccessAdmin(user: User | null): boolean {
  return user?.role === "teacher" || user?.role === "admin" || user?.is_admin === true
}

export async function getUserById(id: number): Promise<User | null> {
  if (!sql) {
    console.warn("Database not available")
    return null
  }

  try {
    const result = await sql`
      SELECT id, email, name, role, student_id, employee_id, department, program, year_level
      FROM users 
      WHERE id = ${id}
    `

    if (result.length === 0) return null

    return result[0] as User
  } catch (error) {
    console.error("Get user by ID error:", error)
    return null
  }
}
