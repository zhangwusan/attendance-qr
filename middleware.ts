import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
<<<<<<< HEAD
import { getUserFromRequest, canAccessAdmin } from "@/lib/auth"
=======
import { getUserFromRequest } from "@/lib/auth"
>>>>>>> e27b8ad (fixed code)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

<<<<<<< HEAD
  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (!canAccessAdmin(user)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect teacher routes
  if (pathname.startsWith("/teacher")) {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect student routes
  if (pathname.startsWith("/student")) {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (user.role !== "student") {
      return NextResponse.redirect(new URL("/login", request.url))
=======
  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/api/auth/login", "/api/health"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const user = await getUserFromRequest(request)

  if (!user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  if (pathname.startsWith("/admin")) {
    if (user.role !== "admin" && !user.is_admin) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (pathname.startsWith("/teacher")) {
    if (user.role !== "teacher" && user.role !== "admin" && !user.is_admin) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (pathname.startsWith("/student")) {
    if (user.role !== "student" && user.role !== "admin" && !user.is_admin) {
      return NextResponse.redirect(new URL("/", request.url))
>>>>>>> e27b8ad (fixed code)
    }
  }

  return NextResponse.next()
}

export const config = {
<<<<<<< HEAD
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
=======
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
>>>>>>> e27b8ad (fixed code)
}
