import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'healthtime-clinic-secret-key-change-me'
);

// Paths that do not require authentication
const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/_next',
  '/favicon.ico',
  '/vite.svg'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Check if path is public
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Check for session cookie
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    // API routes: Return 401
    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Pages: Redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 3. Verify Token
  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // Invalid token
    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Clear the invalid cookie
    const response = NextResponse.redirect(url);
    response.cookies.delete('session_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> Wait, we want to match API routes to protect them!
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
