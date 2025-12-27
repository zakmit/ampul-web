'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('UserLayout');
  const locale = useLocale();
  const pathname = usePathname();
  const isProfilePage = pathname?.includes('/u/profile');

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex justify-between items-end mx-4 px-2 py-4 border-b border-gray-500">
          {isProfilePage ? (
            <>
              <h1 className="text-xl font-bold">{t('myInformation')}</h1>
              <Link href={`/${locale}/u/orders`} className="text-sm italic font-title hover:underline hover:text-gray-700">
                →{t('myOrders')}
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold">{t('myOrders')}</h1>
              <Link href={`/${locale}/u/profile`} className="text-sm italic font-title hover:underline hover:text-gray-700">
                →{t('myInformation')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout: 1:4 grid */}
      <div className="lg:grid lg:grid-cols-5 lg:min-h-screen">
        {/* Left Sidebar - 1/5 width */}
        <aside className="hidden lg:block lg:col-span-1 p-8">
          <nav className="space-y-4">
            <Link
              href={`/${locale}/u/profile`}
              className={`block text-base font-title italic mb-8 ${
                isProfilePage
                  ? 'border-gray-700 text-gray-900 underline font-bold border-l-2 pl-2 -ml-2'
                  : 'text-gray-500 hover:text-gray-900 hover:underline transition-colors'
              }`}
            >
              {t('myInformation')}
            </Link>
            <Link
              href={`/${locale}/u/orders`}
              className={`block text-base font-title italic ${
                isProfilePage
                  ? 'text-gray-500 hover:text-gray-900 hover:underline transition-colors'
                  : 'border-gray-700 text-gray-900 underline font-bold border-l-2 pl-2 -ml-2'
              }`}
            >
              {t('myOrders')}
            </Link>
          </nav>
        </aside>

        {/* Right Content - 4/5 width with overflow-y scroll */}
        <main className="lg:col-span-4 lg:overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
