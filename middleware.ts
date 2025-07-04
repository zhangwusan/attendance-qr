import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth/login", "/api/health", "/api/railway/health"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  const user = verifyToken(token)
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (pathname.startsWith("/teacher") && user.role !== "teacher") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (pathname.startsWith("/student") && user.role !== "student") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
