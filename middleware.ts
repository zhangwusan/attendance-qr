import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserFromRequest, canAccessAdmin } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
}
