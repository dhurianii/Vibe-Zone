import { usePlayer } from '../context/PlayerContext';
import { LanguageFilter } from '../types/music';

interface LanguageTabsProps {
  value: LanguageFilter;
  onChange: (lang: LanguageFilter) => void;
}

export function LanguageTabs({ value, onChange }: LanguageTabsProps) {
  const { languages } = usePlayer();
  const options: { id: LanguageFilter; label: string }[] = [
    { id: 'All', label: 'All Languages' },
    ...languages.map((lang) => ({ id: lang, label: lang })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter by language"
      className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-white/[0.08] bg-[#0D1018]"
    >
      {options.map((lang) => {
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
