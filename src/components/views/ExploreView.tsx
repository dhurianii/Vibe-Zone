import { Play, Shuffle } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { ArtworkImage } from '../ArtworkImage';
import { LanguageTabs } from '../LanguageTabs';
import { TrackList } from '../TrackList';

export function ExploreView() {
  const {
    moods,
    getMood,
    getMoodTracks,
    activeMoodId,
    setActiveMoodId,
    languageFilter,
    setLanguageFilter,
    playMood,
  } = usePlayer();
  const mood = getMood(activeMoodId);
  const tracks = getMoodTracks(activeMoodId, languageFilter);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Explore Moods
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#A1A1AA] max-w-2xl">
          Switch effortlessly between all {moods.length} atmospheric channels to match your energy, activity, or state of mind.
        </p>
      </div>

      {/* Interactive Mood Selector Bar */}
      <div
        role="tablist"
        aria-label="Mood categories"
        className="flex flex-wrap gap-2"
      >
        {moods.map((item) => {
          const active = item.id === activeMoodId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveMoodId(item.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
                active
                  ? 'bg-[#B6FF00] text-[#08090D] shadow-md shadow-[#B6FF00]/20'
                  : 'bg-[#0F1118] text-[#A1A1AA] border border-white/[0.08] hover:text-white hover:border-[#9D4EDD]/50'
              }`}
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Mood Spotlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#9D4EDD]/30 bg-[#0F1118]">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] items-stretch">
          <div className="relative h-48 md:h-auto overflow-hidden">
            <ArtworkImage
              src={mood.coverImage}
              alt={`${mood.name} mood artwork`}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top right, rgba(8,9,13,0.82), ${mood.glowColor})`,
              }}
            />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div>
              <p className="text-xs font-medium text-[#C77DFF]">
                Curated channel · {tracks.length} tracks
              </p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-white">
                {mood.emoji} {mood.name}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed">
                {mood.description}
              </p>
              <p className="mt-2 text-xs text-[#A1A1AA]">
                {mood.curatorNote}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={tracks.length === 0}
                onClick={() => playMood(mood.id, false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:brightness-110 transition-all whitespace-nowrap shadow-[0_6px_20px_rgba(182,255,0,0.22)] disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play {mood.name}</span>
              </button>

              <button
                type="button"
                disabled={tracks.length === 0}
                onClick={() => playMood(mood.id, true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-white border border-[#9D4EDD]/45 bg-[#08090D]/60 hover:border-[#B6FF00]/60 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4 text-[#C77DFF]" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Language Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <LanguageTabs value={languageFilter} onChange={setLanguageFilter} />
        <span className="text-xs text-[#A1A1AA] tabular-nums">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
        </span>
      </div>

      {/* Curated Songs for Selected Mood */}
      <TrackList
        tracks={tracks}
        emptyTitle={
          languageFilter === 'All'
            ? `No songs in ${mood.name} yet`
            : `No ${languageFilter} tracks in ${mood.name}`
        }
        emptyDescription={
          languageFilter === 'All'
            ? 'This mood channel is clean and ready for new songs.'
            : 'Switch to All Languages or choose another mood tab above.'
        }
      />
    </div>
  );
}
