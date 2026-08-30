import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { routing } from './src/i18n/routing';
import { authConfig } from './src/auth.config';
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Use the adapter-free config here: importing `@/auth` would pull Prisma and
// `pg` into the middleware bundle. Session data is still read from the cookie.
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  // Handle i18n routing
  return handleI18nRouting(request as NextRequest);
});

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized
  matcher: ['/', '/(us|fr|tw)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
