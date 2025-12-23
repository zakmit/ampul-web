import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {localeToMessageFile, type Locale} from './config';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // Map locale to message file
  const messageFile = localeToMessageFile[locale as Locale] || 'en';

  return {
    locale,
    messages: (await import(`../../messages/${messageFile}.json`)).default
  };
});