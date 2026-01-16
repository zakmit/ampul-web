import type { Locale } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

interface LegalPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('legal'),
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LegalPage' });

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12 lg:py-20 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-center pb-6 mb-4 border-b border-gray-900">{t('title')}</h1>

        <div className="space-y-6 text-left">
          <p className="text-lg">{t('demoNotice')}</p>

          <ul className="list-disc list-inside space-y-2">
            <li>{t('noTransactions')}</li>
            <li>{t('noRealData')}</li>
            <li>{t('dataStored')}</li>
            <li>{t('dataNotShared')}</li>
            <li>{t('noCookies')}</li>
          </ul>

          <p className="text-sm text-gray-500 mt-8">
            © {new Date().getFullYear()} AMPUL
          </p>
        </div>
      </div>
    </div>
  );
}
