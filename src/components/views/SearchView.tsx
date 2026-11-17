import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { LanguageFilter } from '../../types/music';
import { LanguageTabs } from '../LanguageTabs';
import { TrackList } from '../TrackList';

const QUICK_PROMPTS = [
  'Hindi',
  'Marathi',
  'Arijit Singh',
  'Ajay-Atul',
  'Lofi',
  'Workout',
  'Romantic',
  'Devotional',
];

export function SearchView() {
  const { tracks, moods } = usePlayer();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<LanguageFilter>('All');

  const filteredTracks = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    const moodNameMap = new Map(
      moods.map((m) => [m.id, m.name.toLowerCase()])
    );

    return tracks.filter((track) => {
      if (language !== 'All' && track.language !== language) {
        return false;
      }
      if (!trimmed) {
        return true;
      }
      const moodName = moodNameMap.get(track.moodId) ?? '';
      return (
        track.title.toLowerCase().includes(trimmed) ||
        track.artist.toLowerCase().includes(trimmed) ||
        (track.album ?? '').toLowerCase().includes(trimmed) ||
        track.language.toLowerCase().includes(trimmed) ||
        moodName.includes(trimmed) ||
        track.keywords.some((kw) => kw.toLowerCase().includes(trimmed))
      );
    });
  }, [language, moods, query, tracks]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Search Songs
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#A1A1AA]">
          Search across titles, artists, instruments, or mood keywords.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="w-5 h-5 text-[#A1A1AA] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'Lofi', 'Beethoven', 'Workout', 'Night Drive'..."
          aria-label="Search songs, artists, or moods"
          className="w-full h-13 pl-12 pr-12 rounded-2xl border border-white/[0.1] bg-[#0F1118] text-sm sm:text-base text-white placeholder:text-[#A1A1AA]/60 focus:outline-none focus:border-[#B6FF00] focus:ring-2 focus:ring-[#B6FF00]/25 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#A1A1AA] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Language Filter & Quick Prompts */}
      <div className="space-y-3">
        <LanguageTabs value={language} onChange={setLanguage} />

        <div className="flex flex-wrap items-center gap-2">
          {QUICK_PROMPTS.map((term) => {
            const active = query.trim().toLowerCase() === term.toLowerCase();
            return (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(active ? '' : term)}
                className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#B6FF00] text-[#08090D]'
                    : 'bg-[#0F1118] text-[#A1A1AA] border border-white/[0.08] hover:text-white hover:border-[#9D4EDD]/50'
                }`}
              >
                {term}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
        <span className="tabular-nums">
          {filteredTracks.length}{' '}
          {filteredTracks.length === 1 ? 'track' : 'tracks'}
          {query.trim() ? ` matching "${query.trim()}"` : ' in catalog'}
        </span>
      </div>

      <TrackList
        tracks={filteredTracks}
        showMoodName
        emptyTitle="No matching songs found"
        emptyDescription="Try searching by another mood keyword like Chill, Piano, Study, or Workout."
      />
    </div>
  );
}
