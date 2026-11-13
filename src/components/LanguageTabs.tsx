import { LanguageFilter } from '../types/music';

interface LanguageTabsProps {
  value: LanguageFilter;
  onChange: (lang: LanguageFilter) => void;
}

const LANGUAGES: { id: LanguageFilter; label: string }[] = [
  { id: 'All', label: 'All Languages' },
  { id: 'Hindi', label: 'Hindi' },
  { id: 'Marathi', label: 'Marathi' },
  { id: 'English', label: 'English' },
  { id: 'Instrumental', label: 'Instrumental' },
];

export function LanguageTabs({ value, onChange }: LanguageTabsProps) {
  return (
    <div
      role="group"
      aria-label="Filter by language"
      className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-white/[0.08] bg-[#0D1018]"
    >
      {LANGUAGES.map((lang) => {
        const active = value === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            onClick={() => onChange(lang.id)}
            aria-pressed={active}
            className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
