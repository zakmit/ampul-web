import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const headersList = await headers();

  // Check if user has previously selected a locale (next-intl stores this in a cookie)
  const localeCookie = cookieStore.get('NEXT_LOCALE');

  if (localeCookie?.value) {
    // User has a saved locale preference
    redirect(`/${localeCookie.value}`);
  }

  // No saved preference, detect from browser language
  const acceptLanguage = headersList.get('accept-language');
  let detectedLocale = 'us'; // default

  if (acceptLanguage) {
    // Parse accept-language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase());

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
  }

  redirect(`/${detectedLocale}`);
}
