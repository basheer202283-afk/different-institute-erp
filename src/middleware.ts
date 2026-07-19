import { NextResponse, type NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/verify"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes completely
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public paths pass through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const hasSession = request.cookies.has("sb-auth-token") ||
                     request.cookies.has("sb-refresh-token") ||
                     Array.from(request.cookies.getAll()).some(c => c.name.startsWith("sb-"));

  // If no auth cookies, redirect to login (only for API routes)
  // For page routes, let the client AdminShell handle it so the UI renders
  if (!hasSession && pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
