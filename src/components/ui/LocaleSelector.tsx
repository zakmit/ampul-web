'use client';

import { useParams, usePathname as useNextPathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { type Locale, defaultLocale, locales } from '@/i18n/config';

// Locale options
const LOCALES = [
  { code: 'us', label: 'English (U.S)' },
  { code: 'fr', label: 'Français (France)' },
  { code: 'tw', label: '中文（台灣）' },
] as const;

const SELECT_STYLE = "w-60 font-semibold mx-auto lg:mr-8 px-4 py-2 pr-10 border border-gray-900 bg-gray-100 focus:outline-none appearance-none cursor-pointer";

export default function LocaleSelector() {
  const params = useParams();
  const router = useRouter();
  const pathname = useNextPathname();
  const [isPending, startTransition] = useTransition();

  // Get locale from URL params, fallback to default
  const currentLocale = (params.locale as Locale) || defaultLocale;

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      // Remove current locale from pathname if it exists
      let path = pathname;
      for (const loc of locales) {
        if (path.startsWith(`/${loc}`)) {
          path = path.slice(`/${loc}`.length) || '/';
          break;
        }
      }

      // Construct new path with locale prefix (always add prefix now)
      const newPath = `/${newLocale}${path}`;

      router.replace(newPath);
    });
  };

  return (
    <div className="w-full bg-gray-100 pb-10 flex justify-center">
      <select
        value={currentLocale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        className={SELECT_STYLE}
        disabled={isPending}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1em 1em',
        }}
      >
        {LOCALES.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export type { Locale };
