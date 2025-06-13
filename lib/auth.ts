import { sql } from "./db"
import type { User } from "./db"

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    // In a real app, you'd hash the password and compare
    // For demo purposes, we'll use simple email-based auth
    const users = await sql`
      SELECT id, email, name, role, student_id 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const users = await sql`
      SELECT id, email, name, role, student_id 
      FROM users 
      WHERE id = ${id}
    `

    return users.length > 0 ? (users[0] as User) : null
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}
