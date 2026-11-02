import { NextResponse, type NextRequest } from "next/server";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000/api/v1";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("sessionId");
  const pathname = request.nextUrl.pathname;

  // Never intercept session-expired page to avoid redirect loops
  if (pathname === "/auth/session-expired") {
    return NextResponse.next();
  }

  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname.startsWith("/auth");

  // 1. Protected route accessed without any session cookie: redirect to login
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 2. Session cookie exists: validate it against /auth/me
  if (sessionCookie) {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: {
          cookie: `sessionId=${encodeURIComponent(sessionCookie.value)}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        // Authenticated user trying to access login/register: redirect to dashboard
        if (isAuthRoute) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
      }

      if (response.status === 401) {
        // Cookie is expired or invalid on the backend
        if (isProtectedRoute) {
          const redirectResponse = NextResponse.redirect(
            new URL("/auth/session-expired", request.url),
          );
          redirectResponse.cookies.delete("sessionId");
          return redirectResponse;
        }

        // On auth routes, clear the dead cookie and let them view the auth page
        const nextResponse = NextResponse.next();
        nextResponse.cookies.delete("sessionId");
        return nextResponse;
      }
    } catch {
      // Keep pages available if API is temporarily unreachable
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*", "/dashboard"],
};
