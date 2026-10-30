import { NextResponse, type NextRequest } from 'next/server';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'http://localhost:3000/api/v1';

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('sessionId');

  if (!sessionCookie) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      headers: { cookie: `sessionId=${encodeURIComponent(sessionCookie.value)}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch {
    // Keep auth pages available if the API is temporarily unreachable.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*'],
};
