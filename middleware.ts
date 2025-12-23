import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextRequest } from 'next/server';
export { auth as middleware } from "@/auth"

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Detect browser language on root path
  if (request.nextUrl.pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language');

    if (acceptLanguage) {
      // Parse accept-language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
      const languages = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().toLowerCase());

      // Map browser languages to our locale codes
      let detectedLocale = 'us'; // default

      for (const lang of languages) {
        if (lang.startsWith('fr')) {
          detectedLocale = 'fr';
          break;
        } else if (lang.startsWith('zh')) {
          detectedLocale = 'tw';
          break;
        } else if (lang.startsWith('en')) {
          detectedLocale = 'us';
          break;
        }
      }

      // Redirect to detected locale or default to 'us'
      return Response.redirect(new URL(`/${detectedLocale}`, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized
  matcher: ['/', '/(us|fr|tw)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
