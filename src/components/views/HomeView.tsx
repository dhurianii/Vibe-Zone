import { ArrowRight, Play, Shuffle } from 'lucide-react';
import { useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { HERO_BANNER_IMAGE } from '../../data/moodsAndTracks';
import { MoodId, SectionView } from '../../types/music';
import { ArtworkImage } from '../ArtworkImage';
import { LanguageTabs } from '../LanguageTabs';
import { MoodCard } from '../MoodCard';
import { TrackList } from '../TrackList';

interface HomeViewProps {
  onNavigate: (section: SectionView) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const {
    moods,
    getMood,
    getMoodTracks,
    activeMoodId,
    setActiveMoodId,
    languageFilter,
    setLanguageFilter,
    currentTrack,
    status,
    playMood,
  } = usePlayer();

  const trackSectionRef = useRef<HTMLElement | null>(null);

  const selectedMood = getMood(activeMoodId);
  const selectedTracks = getMoodTracks(activeMoodId, languageFilter);

  const handleSelectMood = (moodId: MoodId) => {
    setActiveMoodId(moodId);
    // Smooth scroll to tracks on smaller screens so discovery feels immediate
    if (window.innerWidth < 768 && trackSectionRef.current) {
      trackSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-10 items-stretch">
        <div className="flex flex-col justify-center py-2 sm:py-4">
          <p className="text-sm font-medium text-[#C77DFF]">
            Mood-first music discovery
          </p>

          <h1
            className="mt-3 font-display font-bold text-white tracking-tight leading-[1.08]"
            style={{
              fontSize: 'clamp(2.25rem, 4.2vw, 3.65rem)',
              textWrap: 'balance',
            }}
          >
            Don&apos;t search for music. Find your vibe.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#A1A1AA] leading-relaxed max-w-xl">
            Skip endless scrolling through generic playlists. Pick the mood that fits your moment, discover hand-picked tracks, and stream instantly.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => playMood(activeMoodId)}
              className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:brightness-110 shadow-[0_8px_24px_rgba(182,255,0,0.25)] transition-all duration-150 active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play {selectedMood.name} Vibe</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
            >
              <span>Explore all {moods.length} moods</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Visual Anchor */}
        <div className="relative overflow-hidden rounded-2xl border border-[#9D4EDD]/30 bg-[#0F1118] min-h-[230px] lg:h-full">
          <ArtworkImage
            src={HERO_BANNER_IMAGE}
            alt="Atmospheric dark studio soundscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/95 via-[#08090D]/35 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#C77DFF]">
                Selected mood · {selectedTracks.length} tracks
              </p>
              <p className="mt-1 font-display text-xl sm:text-2xl font-bold text-white truncate">
                {selectedMood.emoji} {selectedMood.name}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm text-[#A1A1AA] line-clamp-1">
                {selectedMood.curatorNote}
              </p>
            </div>

            <button
              type="button"
              onClick={() => playMood(activeMoodId)}
              aria-label={`Play ${selectedMood.name}`}
              className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-[#B6FF00] text-[#08090D] hover:brightness-110 transition-transform active:scale-95 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Play className="w-5 h-5 fill-current translate-x-[1px]" />
            </button>
          </div>
        </div>
      </section>

      {/* 10 Mood Categories Grid */}
      <section aria-labelledby="mood-grid-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2
              id="mood-grid-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight"
            >
              Choose your mood
            </h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Tap any card to preview its curated tracks, or press play to start immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {moods.map((mood) => {
            const count = getMoodTracks(mood.id, languageFilter).length;
            const isPlayingThisMood =
              currentTrack?.moodId === mood.id &&
              (status === 'playing' || status === 'loading');

            return (
              <MoodCard
                key={mood.id}
                mood={mood}
                trackCount={count}
                isSelected={activeMoodId === mood.id}
                isPlayingThisMood={isPlayingThisMood}
                onSelect={handleSelectMood}
                onPlayMood={(id) => playMood(id)}
              />
            );
          })}
        </div>
      </section>

      {/* Active Mood Curated Soundtrack */}
      <section ref={trackSectionRef} aria-labelledby="curated-tracks-heading">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-medium text-[#C77DFF]">
              Curated soundtrack
            </p>
            <h2
              id="curated-tracks-heading"
              className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight"
            >
              {selectedMood.emoji} {selectedMood.name}
            </h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              {selectedMood.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <LanguageTabs value={languageFilter} onChange={setLanguageFilter} />

            <button
              type="button"
              onClick={() => playMood(activeMoodId, false)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:brightness-110 transition-all whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            <button
              type="button"
              onClick={() => playMood(activeMoodId, true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-medium text-white border border-[#9D4EDD]/45 bg-[#0F1118] hover:border-[#B6FF00]/60 transition-colors whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4 text-[#C77DFF]" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        <TrackList
          tracks={selectedTracks}
          emptyTitle={`No ${languageFilter} tracks in ${selectedMood.name}`}
          emptyDescription="Switch to All Languages or pick another language filter above."
        />
      </section>
    </div>
  );
}
