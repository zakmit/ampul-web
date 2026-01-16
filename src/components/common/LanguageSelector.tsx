// Locale options
const LOCALES = [
  { code: 'en-US', label: 'English (U.S)' },
  { code: 'fr-FR', label: 'Français (France)' },
  { code: 'zh-TW', label: '中文（台灣）' },
] as const;

type Locale = typeof LOCALES[number]['code'];

const SELECT_STYLE = "w-60 font-semibold mx-auto -mb-[1px] px-4 py-2 pr-10 border-l border-r border-t border-gray-900 bg-gray-200 focus:outline-none appearance-none cursor-pointer";

interface LanguageSelectorProps {
  value: Locale;
  onChange: (locale: Locale) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Locale)}
      className={SELECT_STYLE}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1em 1em',
      }}
    >
      {LOCALES.map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.label}
        </option>
      ))}
    </select>
  );
}

export type { Locale };
export { LOCALES };
