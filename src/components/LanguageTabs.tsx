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
      className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-white/[0.09] bg-[#0F1118]"
    >
      {options.map((lang) => {
        const active = value === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            onClick={() => onChange(lang.id)}
            aria-pressed={active}
            className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
              active
                ? 'bg-[#B6FF00] text-[#08090D] shadow-[0_0_14px_-3px_rgba(182,255,0,0.45)]'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
