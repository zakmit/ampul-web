import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';
import NavBar from '@/components/common/NavBar';
import Footer from '@/components/common/Footer';
import LocaleSelector from '@/components/common/LocaleSelector';
import { LXGW_WenKai_TC } from 'next/font/google';
import { Averia_Serif_Libre } from 'next/font/google';
import { Zilla_Slab } from 'next/font/google';


const aSLibre = Averia_Serif_Libre({
  weight: ["300","400","700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-asL",
})

const ziliaSlab = Zilla_Slab({
  weight: ["300","400","500","600","700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-zilia",
})


// CJK sans font for Traditional Chinese - only loaded when locale is 'tw'
const lxgwWenkaiTC = LXGW_WenKai_TC({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-cjk-sans',
});

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

  // Conditionally apply CJK font CSS variables only for 'tw' locale
  const fontClasses = locale === 'tw'
    ? `${aSLibre.variable} ${ziliaSlab.variable} ${lxgwWenkaiTC.variable}`
    : '';

  return (
    <>
      {locale === 'tw' && (
        <link
          rel="stylesheet"
          href="https://fontsapi.zeoseven.com/256/main/result.css"
        />
      )}
      <div
        className={fontClasses}
        style={locale === 'tw' ? {
          '--font-title': `${aSLibre.style.fontFamily}, "Huiwen-mincho", serif`,
          '--font-context': `${ziliaSlab.style.fontFamily}, ${lxgwWenkaiTC.style.fontFamily}, sans-serif`,
        } as React.CSSProperties : undefined}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <NavBar showBanner={true} />
          {children}
          <Footer/>
          <LocaleSelector />
        </NextIntlClientProvider>
      </div>
    </>
  );
}
