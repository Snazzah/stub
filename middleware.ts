import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|static|[\\w-]+\\.\\w+).*)'
  ]
};

const loginPages = ['/login', '/register', '/login/error'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!session && !loginPages.includes(path)) {
    return NextResponse.redirect(new URL('/login', req.url));
  } else if (session && loginPages.includes(path)) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}
