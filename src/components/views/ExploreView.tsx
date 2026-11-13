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
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
          Switch effortlessly between all 10 atmospheric channels to match your energy, activity, or state of mind.
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
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-950/50'
                  : 'bg-[#10131D] text-slate-300 border border-white/[0.08] hover:text-white hover:border-white/[0.18]'
              }`}
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Mood Spotlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0E111B]">
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
                background: `linear-gradient(to top right, rgba(7,8,11,0.8), ${mood.glowColor})`,
              }}
            />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div>
              <p className="text-xs font-medium text-indigo-400">
                Curated channel · {tracks.length} tracks
              </p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-white">
                {mood.emoji} {mood.name}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {mood.description}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {mood.curatorNote}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => playMood(mood.id, false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition-colors whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play {mood.name}</span>
              </button>

              <button
                type="button"
                onClick={() => playMood(mood.id, true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-slate-200 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-colors whitespace-nowrap"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Language Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <LanguageTabs value={languageFilter} onChange={setLanguageFilter} />
        <span className="text-xs text-slate-400 tabular-nums">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
        </span>
      </div>

      {/* Curated Songs for Selected Mood */}
      <TrackList
        tracks={tracks}
        emptyTitle={`No ${languageFilter} tracks in ${mood.name}`}
        emptyDescription="Switch to All Languages or choose another mood tab above."
      />
    </div>
  );
}
