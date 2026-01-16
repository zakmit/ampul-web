import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

interface CheckoutLayoutProps {
  params: Promise<{
    locale: string
  }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: CheckoutLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('checkout'),
  };
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return <>{children}</>;
}
