import { NextResponse, type NextRequest } from 'next/server';
import { AuthenticationService } from '@/src/infrastructure/services/authentication.service';
import { SESSION_COOKIE } from '@/config';

const authenticationService = new AuthenticationService();

export async function middleware(request: NextRequest) {
  const isAuthPath =
    request.nextUrl.pathname === '/sign-in' ||
    request.nextUrl.pathname === '/sign-up';

  if (!isAuthPath) {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    try {
      // Use AuthenticationService directly
      await authenticationService.validateSession(sessionId);
    } catch (err) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
