import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieSet = { name: string; value: string; options?: Record<string, unknown> };

const publicPaths = ["/", "/login", "/register", "/forgot-password"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p);
}

const routePermissions: Record<string, string[]> = {
  "/admin": ["super_admin", "owner", "hr_manager"],
  "/finance": ["super_admin", "owner", "finance_manager"],
  "/settings": ["super_admin", "owner"],
};

function hasRouteAccess(pathname: string, role: string | null): boolean {
  if (!role) return false;
  if (role === "super_admin" || role === "owner") return true;
  for (const [route, roles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) return roles.includes(role);
  }
  return true;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: CookieSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Security headers
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-XSS-Protection", "1; mode=block");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Public paths
  if (isPublicPath(pathname)) {
    if (user && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Protected paths - require auth
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Get user profile for role and organization context
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id, branch_id")
    .eq("id", user.id)
    .single();

  const profileData = profile as unknown as { role: string; organization_id: string | null; branch_id: string | null } | null;
  const role = profileData?.role ?? null;

  // Check role-based access
  if (!hasRouteAccess(pathname, role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Dashboard requires organization context
  if (pathname.startsWith("/dashboard") && !profileData?.organization_id) {
    // Allow access but dashboard will show setup prompt
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
