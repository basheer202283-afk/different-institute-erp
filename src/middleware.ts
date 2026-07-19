import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieSet = { name: string; value: string; options?: Record<string, unknown> };

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];

function isPublicPath(pathname: string): boolean {
  // Exact match for root
  if (pathname === "/") return true;
  // Prefix match for auth paths
  return PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(p));
}

// Role-based route restrictions
const ROUTE_ROLES: Record<string, string[]> = {
  "/admin": ["super_admin", "owner", "hr_manager"],
  "/finance": ["super_admin", "owner", "finance_manager"],
  "/settings": ["super_admin", "owner"],
};

function hasRouteAccess(pathname: string, role: string | null): boolean {
  if (!role) return false;
  if (role === "super_admin" || role === "owner") return true;
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(route)) return roles.includes(role);
  }
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Create Supabase client with cookie handling
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>);
          });
        },
      },
    }
  );

  // Add security headers
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-XSS-Protection", "1; mode=block");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Handle public paths
  if (isPublicPath(pathname)) {
    // If authenticated user visits login/register, redirect to dashboard
    if (pathname === "/login" || pathname === "/register") {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch {
        // If auth check fails, allow access to public page
      }
    }
    return supabaseResponse;
  }

  // For protected paths, check authentication
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // If auth check fails, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If no user, redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check role-based access for restricted routes
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as unknown as { role: string | null })?.role ?? null;

    if (!hasRouteAccess(pathname, role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // If profile check fails, allow access (RLS will handle it)
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
