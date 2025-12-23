export const locales = ['us', 'fr', 'tw'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  'us': 'English (U.S)',
  'fr': 'Français (France)',
  'tw': '中文（台灣）',
};

export const defaultLocale: Locale = 'us';

// Map locale codes to message file names
export const localeToMessageFile: Record<Locale, string> = {
  'us': 'en',
  'fr': 'fr-FR',
  'tw': 'zh-TW',
};
