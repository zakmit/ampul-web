import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default handleI18nRouting;

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized
  matcher: ['/', '/(us|fr|tw)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
