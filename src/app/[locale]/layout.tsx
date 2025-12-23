import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';
import NavBar from '@/components/ui/NavBar';
import Footer from '@/components/ui/Footer';
import LocaleSelector from '@/components/ui/LocaleSelector';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // Pass the locale to getMessages to load the correct translations
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <NavBar showBanner={true} bannerHeight={6} />
      {children}
      <Footer/>
      <LocaleSelector />
    </NextIntlClientProvider>
  );
}
