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

  // Reset playlist selection when switching category
  useEffect(() => {
    setSelectedPlaylistId(null);
  }, [category.id]);

  // Sync shell ambient glow with category mood without disturbing active playback
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
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-slate-200 hover:text-white border border-white/[0.1] bg-[#141933]/80 hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {modeMeta.title}</span>
        </button>

        <span className="text-xs font-medium text-slate-400">
          {modeMeta.title}
        </span>
      </div>

      {/* 1. Immersive Category Header */}
      <section
        aria-label={`${category.title} header`}
        className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-[#101426] shadow-[0_24px_80px_-24px_rgba(53,107,255,0.35)]"
      >
        {/* Background Artwork + Measured Gradient Scrim */}
        <div className="absolute inset-0">
          <ArtworkImage
            src={category.coverImage}
            alt={`${category.title} mood backdrop`}
            className="w-full h-full object-cover opacity-55"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(125deg, rgba(16, 20, 38, 0.96) 15%, rgba(16, 20, 38, 0.78) 55%, ${category.glowColor} 100%)`,
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
                  'radial-gradient(circle, rgba(53,107,255,0.32), rgba(167,139,250,0.16), transparent 70%)',
                willChange: 'transform, opacity',
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
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
                <stop offset="0%" stopColor="#356BFF" stopOpacity="0" />
                <stop offset="40%" stopColor="#356BFF" stopOpacity="0.85" />
                <stop offset="75%" stopColor="#A78BFA" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
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
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-full md:aspect-square rounded-2xl overflow-hidden border border-white/[0.16] shadow-2xl shadow-black/50 shrink-0">
            <ArtworkImage
              src={category.coverImage}
              alt={`${category.title} cover artwork`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between gap-5 min-w-0">
            <div>
              <p className="text-xs font-medium text-[#A78BFA]">
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

              <p className="mt-2.5 text-base sm:text-lg text-slate-100/95 font-medium max-w-2xl leading-relaxed">
                &ldquo;{category.description}&rdquo;
              </p>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-300/85 max-w-2xl">
                {category.curatorNote}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handlePlayAll(false)}
                disabled={playableTracks.length === 0}
                className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[46px] rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#356BFF] to-[#A78BFA] hover:brightness-110 shadow-lg shadow-[#356BFF]/30 transition-all active:scale-[0.985] disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY ALL</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayAll(true)}
                disabled={playableTracks.length === 0}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[46px] rounded-xl text-sm font-medium text-slate-100 border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1] transition-colors disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Playlists Section (derived strictly from real catalog tracks) */}
      {curatedPlaylists.length > 0 && (
        <section aria-label="Curated playlists" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Curated Playlists
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
                Select a playlist to focus the tracklist or press play directly.
              </p>
            </div>

            {activePlaylist && (
              <button
                type="button"
                onClick={() => setSelectedPlaylistId(null)}
                className="text-xs font-medium text-[#A78BFA] hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/10"
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
                  className={`group relative overflow-hidden rounded-2xl border p-4 flex items-center gap-3.5 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF] ${
                    isSelected
                      ? 'border-[#356BFF] bg-gradient-to-br from-[#356BFF]/20 via-[#141933] to-[#A78BFA]/15 shadow-lg shadow-[#356BFF]/20'
                      : 'border-white/[0.09] bg-[#141933]/60 hover:bg-[#161D3B]/90 hover:border-white/[0.18]'
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
                    <p className="mt-0.5 text-xs text-slate-400 truncate">
                      {playlist.subtitle}
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium text-[#A78BFA] tabular-nums">
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
                        ? 'bg-gradient-to-r from-[#356BFF] to-[#A78BFA] text-white shadow-md shadow-[#356BFF]/30'
                        : 'bg-white/[0.07] text-slate-200 group-hover:bg-[#356BFF] group-hover:text-white'
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
            <span className="text-xs text-slate-400 tabular-nums">
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
