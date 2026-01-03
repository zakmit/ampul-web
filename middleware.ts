import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { auth } from "@/auth";
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default auth((request) => {
  // Handle i18n routing
  return handleI18nRouting(request as NextRequest);
});

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized
  matcher: ['/', '/(us|fr|tw)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
