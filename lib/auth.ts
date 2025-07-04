<<<<<<< HEAD
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

const secretKey = process.env.JWT_SECRET || "fallback-secret-key"
const key = new TextEncoder().encode(secretKey)
=======
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { sql } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development"
>>>>>>> e27b8ad (fixed code)

export interface User {
  id: number
  email: string
  name: string
<<<<<<< HEAD
  role: "teacher" | "student" | "admin"
=======
  role: string
>>>>>>> e27b8ad (fixed code)
  student_id?: string
  employee_id?: string
  department?: string
  program?: string
  year_level?: number
  is_admin?: boolean
}

export async function hashPassword(password: string): Promise<string> {
<<<<<<< HEAD
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
=======
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  // Simple token generation without JWT library
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    is_admin: user.is_admin || false,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function verifyToken(token: string): any {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token is expired
    if (payload.exp && Date.now() > payload.exp) {
      return null
    }

    return payload
>>>>>>> e27b8ad (fixed code)
  } catch (error) {
    return null
  }
}

<<<<<<< HEAD
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
=======
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const users = await sql`
      SELECT id, email, name, role, student_id, employee_id, department, program, year_level, is_admin
      FROM users 
      WHERE id = ${decoded.id}
    `

    if (!users[0]) return null
    const user: User = {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name,
      role: users[0].role,
      student_id: users[0].student_id,
      employee_id: users[0].employee_id,
      department: users[0].department,
      program: users[0].program,
      year_level: users[0].year_level,
      is_admin: users[0].is_admin,
    }
    return user
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    return getUserFromToken(token)
  } catch (error) {
    console.error("Error getting user from request:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null

    return getUserFromToken(token)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
>>>>>>> e27b8ad (fixed code)
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
<<<<<<< HEAD
    maxAge: 60 * 60 * 24, // 24 hours
=======
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
>>>>>>> e27b8ad (fixed code)
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

<<<<<<< HEAD
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
=======
export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, role, student_id, employee_id, department, program, year_level, is_admin
>>>>>>> e27b8ad (fixed code)
      FROM users 
      WHERE id = ${id}
    `

    if (result.length === 0) return null
<<<<<<< HEAD

=======
>>>>>>> e27b8ad (fixed code)
    return result[0] as User
  } catch (error) {
    console.error("Get user by ID error:", error)
    return null
  }
}
<<<<<<< HEAD
=======

// Helper functions
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin" || user?.is_admin === true
}

export function canAccessAdmin(user: User | null): boolean {
  return user?.role === "teacher" || user?.role === "admin" || user?.is_admin === true
}
>>>>>>> e27b8ad (fixed code)
