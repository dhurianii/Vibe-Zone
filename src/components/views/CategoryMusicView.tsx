import { ArrowLeft, Pause, Play, Shuffle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  EXPERIENCE_MODES,
  ExperienceCategoryConfig,
  ResolvedCuratedPlaylist,
  getCuratedPlaylistsForCategory,
  getExperienceTracks,
} from '../../data/experiences';
import { ArtworkImage } from '../ArtworkImage';
import { LanguageTabs } from '../LanguageTabs';
import { TrackList } from '../TrackList';

interface CategoryMusicViewProps {
  category: ExperienceCategoryConfig;
  onBackToDeck: () => void;
}

export function CategoryMusicView({
  category,
  onBackToDeck,
}: CategoryMusicViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const {
    tracks,
    currentTrack,
    status,
    languageFilter,
    setLanguageFilter,
    setActiveMoodId,
    playTrack,
    togglePlayPause,
  } = usePlayer();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );

  const modeMeta = EXPERIENCE_MODES[category.mode];

  useEffect(() => {
    setSelectedPlaylistId(null);
  }, [category.id]);

  useEffect(() => {
    if (!currentTrack) {
      setActiveMoodId(category.primaryMoodId);
    }
  }, [category.primaryMoodId, currentTrack, setActiveMoodId]);

  const allCategoryTracks = useMemo(
    () => getExperienceTracks(category, tracks, 'All'),
    [category, tracks]
  );

  const curatedPlaylists = useMemo(
    () => getCuratedPlaylistsForCategory(category, allCategoryTracks),
    [allCategoryTracks, category]
  );

  const activePlaylist: ResolvedCuratedPlaylist | null = useMemo(
    () =>
      selectedPlaylistId
        ? curatedPlaylists.find((pl) => pl.id === selectedPlaylistId) ?? null
        : null,
    [curatedPlaylists, selectedPlaylistId]
  );

  const displayedTracks = useMemo(() => {
    const base = activePlaylist ? activePlaylist.tracks : allCategoryTracks;
    if (languageFilter === 'All') return base;
    return base.filter((t) => t.language === languageFilter);
  }, [activePlaylist, allCategoryTracks, languageFilter]);

  const playableTracks = useMemo(
    () => displayedTracks.filter((t) => t.provider !== 'pending'),
    [displayedTracks]
  );

  const handlePlayAll = (shuffle = false) => {
    if (playableTracks.length === 0) return;
    const queueList = shuffle
      ? [...playableTracks].sort(() => Math.random() - 0.5)
      : playableTracks;
    const label = activePlaylist
      ? `${category.title} · ${activePlaylist.title}`
      : category.title;
    playTrack(queueList[0], queueList, label);
  };

  const handlePlaylistPlay = (playlist: ResolvedCuratedPlaylist) => {
    const playable = playlist.tracks.filter((t) => t.provider !== 'pending');
    if (playable.length === 0) return;
    const isPlaylistPlaying =
      currentTrack &&
      playable.some((t) => t.id === currentTrack.id) &&
      (status === 'playing' || status === 'loading');

    if (isPlaylistPlaying && selectedPlaylistId === playlist.id) {
      togglePlayPause();
      return;
    }

    setSelectedPlaylistId(playlist.id);
    setLanguageFilter('All');
    playTrack(
      playable[0],
      playable,
      `${category.title} · ${playlist.title}`
    );
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-8">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToDeck}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white border border-white/[0.1] hover:border-[#B6FF00]/45 bg-[#0F1118]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {modeMeta.title}</span>
        </button>

        <span className="text-xs font-medium text-[#A1A1AA]">
          {modeMeta.title}
        </span>
      </div>

      {/* 1. Immersive Category Header */}
      <section
        aria-label={`${category.title} header`}
        className="relative overflow-hidden rounded-3xl border border-[#9D4EDD]/30 bg-[#0F1118] shadow-[0_24px_80px_-28px_rgba(157,78,221,0.3)]"
      >
        {/* Background Artwork + Measured Gradient Scrim */}
        <div className="absolute inset-0">
          <ArtworkImage
            src={category.coverImage}
            alt={`${category.title} mood backdrop`}
            className="w-full h-full object-cover opacity-45"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(125deg, rgba(8, 9, 13, 0.97) 18%, rgba(8, 9, 13, 0.82) 55%, ${category.glowColor} 100%)`,
            }}
          />
        </div>

        {/* Subtle Animated Background Soundwave & Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {!prefersReducedMotion && (
            <motion.div
              className="absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(157,78,221,0.28), rgba(182,255,0,0.12), transparent 70%)',
                willChange: 'transform, opacity',
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <svg
            viewBox="0 0 900 180"
            fill="none"
            className="absolute bottom-0 inset-x-0 w-full h-28 sm:h-36 opacity-45"
          >
            <defs>
              <linearGradient id="cat-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0" />
                <stop offset="40%" stopColor="#9D4EDD" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#B6FF00" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#B6FF00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0 110 C 180 48, 360 156, 540 96 C 720 42, 810 132, 900 84"
              stroke="url(#cat-wave-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              animate={
                prefersReducedMotion ? undefined : { y: [0, -6, 4, 0] }
              }
              transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[230px_1fr] gap-6 sm:gap-8 items-center">
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-full md:aspect-square rounded-2xl overflow-hidden border border-[#9D4EDD]/35 shadow-2xl shadow-black/70 shrink-0">
            <ArtworkImage
              src={category.coverImage}
              alt={`${category.title} cover artwork`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between gap-5 min-w-0">
            <div>
              <p className="text-xs font-medium text-[#C77DFF]">
                {modeMeta.title} · {allCategoryTracks.length}{' '}
                {allCategoryTracks.length === 1 ? 'song' : 'songs'}
              </p>

              <h1
                className="mt-2 font-display font-bold text-white tracking-tight leading-[1.06]"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                  textWrap: 'balance',
                }}
              >
                {category.title} MODE
              </h1>

              <p className="mt-2.5 text-base sm:text-lg text-white/95 font-medium max-w-2xl leading-relaxed">
                &ldquo;{category.description}&rdquo;
              </p>

              <p className="mt-1.5 text-xs sm:text-sm text-[#A1A1AA] max-w-2xl">
                {category.curatorNote}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handlePlayAll(false)}
                disabled={playableTracks.length === 0}
                className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[46px] rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:bg-[#C6FF33] shadow-[0_0_24px_-6px_rgba(182,255,0,0.5)] transition-all active:scale-[0.985] disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY ALL</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayAll(true)}
                disabled={playableTracks.length === 0}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[46px] rounded-xl text-sm font-medium text-white border border-white/[0.14] hover:border-[#9D4EDD]/60 bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
              >
                <Shuffle className="w-4 h-4 text-[#C77DFF]" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Playlists Section */}
      {curatedPlaylists.length > 0 && (
        <section aria-label="Curated playlists" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Curated Playlists
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-[#A1A1AA]">
                Select a playlist to focus the tracklist or press play directly.
              </p>
            </div>

            {activePlaylist && (
              <button
                type="button"
                onClick={() => setSelectedPlaylistId(null)}
                className="text-xs font-medium text-[#B6FF00] hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#B6FF00]/35 bg-[#B6FF00]/10"
              >
                Show All {category.title} Songs
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {curatedPlaylists.map((playlist) => {
              const isSelected = selectedPlaylistId === playlist.id;
              const isThisPlaylistPlaying =
                Boolean(currentTrack) &&
                playlist.tracks.some((t) => t.id === currentTrack?.id) &&
                (status === 'playing' || status === 'loading') &&
                isSelected;

              return (
                <div
                  key={playlist.id}
                  onClick={() => {
                    setSelectedPlaylistId(isSelected ? null : playlist.id);
                    setLanguageFilter('All');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPlaylistId(isSelected ? null : playlist.id);
                      setLanguageFilter('All');
                    }
                  }}
                  className={`group relative overflow-hidden rounded-2xl border p-4 flex items-center gap-3.5 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
                    isSelected
                      ? 'border-[#B6FF00]/75 bg-gradient-to-br from-[#9D4EDD]/20 via-[#0F1118] to-[#B6FF00]/10 shadow-[0_0_24px_-8px_rgba(182,255,0,0.3)]'
                      : 'border-white/[0.09] bg-[#0F1118] hover:bg-[#141722] hover:border-[#9D4EDD]/50'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/[0.1]">
                    <ArtworkImage
                      src={playlist.coverImage}
                      fallbackSrc={category.coverImage}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm sm:text-base font-semibold text-white truncate">
                      {playlist.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#A1A1AA] truncate">
                      {playlist.subtitle}
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium text-[#C77DFF] tabular-nums">
                      {playlist.tracks.length}{' '}
                      {playlist.tracks.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaylistPlay(playlist);
                    }}
                    aria-label={
                      isThisPlaylistPlaying
                        ? `Pause ${playlist.title}`
                        : `Play ${playlist.title}`
                    }
                    className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isSelected
                        ? 'bg-[#B6FF00] text-[#08090D] shadow-[0_0_16px_-3px_rgba(182,255,0,0.5)]'
                        : 'bg-white/[0.07] text-white group-hover:bg-[#B6FF00] group-hover:text-[#08090D]'
                    }`}
                  >
                    {isThisPlaylistPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current translate-x-[0.5px]" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Clean Modern Song List Section */}
      <section aria-label="Category songs" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activePlaylist ? activePlaylist.title : `${category.title} Songs`}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageTabs value={languageFilter} onChange={setLanguageFilter} />
            <span className="text-xs text-[#A1A1AA] tabular-nums">
              {displayedTracks.length}{' '}
              {displayedTracks.length === 1 ? 'song' : 'songs'}
            </span>
          </div>
        </div>

        <TrackList
          tracks={displayedTracks}
          categoryLabel={
            activePlaylist
              ? `${category.title} · ${activePlaylist.title}`
              : category.title
          }
          emptyTitle={`No ${languageFilter} songs in ${
            activePlaylist ? activePlaylist.title : category.title
          }`}
          emptyDescription="Switch to All Languages or clear the active playlist filter to view every song."
        />
      </section>
    </div>
  );
}
