import {
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Heart,
  ListMusic,
  Loader2,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';
import { ArtworkImage } from './ArtworkImage';

/**
 * Persistent Playback Engine & Full-Screen Expanded Music Player.
 * Keeps `providerContainerRef` mounted in an invariant DOM path so toggling between
 * the Mini-Player and Expanded Player never interrupts or recreates playback.
 */
export function PlayerStage() {
  const prefersReducedMotion = useReducedMotion();
  const {
    currentTrack,
    queue,
    status,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffleEnabled,
    repeatMode,
    errorMessage,
    isTheaterOpen,
    setTheaterOpen,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    toggleFavourite,
    isFavourite,
    clearError,
    providerContainerRef,
    getMood,
    activeCategoryLabel,
  } = usePlayer();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [showVideoStage, setShowVideoStage] = useState(false);

  // Reset video toggle if switching to an audio-only track
  useEffect(() => {
    if (currentTrack?.provider !== 'youtube') {
      setShowVideoStage(false);
    }
  }, [currentTrack]);

  // Close Expanded Player on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTheaterOpen) {
        setTheaterOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTheaterOpen, setTheaterOpen]);

  const activeMood = currentTrack ? getMood(currentTrack.moodId) : null;
  const categoryName =
    activeCategoryLabel || (activeMood ? activeMood.name : 'Vibe Zone');

  const effectiveDuration =
    duration > 0 ? duration : currentTrack?.durationSeconds ?? 0;
  const progressPercent =
    currentTrack && !currentTrack.isLive && effectiveDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))
      : 0;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const fav = currentTrack ? isFavourite(currentTrack.id) : false;
  const isVideoVisible =
    isTheaterOpen && showVideoStage && currentTrack?.provider === 'youtube';

  return (
    <section
      aria-label={isTheaterOpen ? 'Expanded music player' : 'Audio playback engine'}
      aria-hidden={!isTheaterOpen}
      className={
        isTheaterOpen
          ? 'fixed inset-0 z-50 bg-[#08090D] overflow-y-auto'
          : 'fixed bottom-2 right-2 w-[260px] h-[160px] opacity-0 pointer-events-none -z-10 overflow-hidden'
      }
    >
      {/* Subtle Animated Ambient Gradient Backdrop (when expanded) */}
      {isTheaterOpen && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <motion.div
            className="absolute -top-32 left-1/4 w-[480px] h-[480px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(157, 78, 221, 0.25), transparent 70%)',
              willChange: 'transform, opacity',
            }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: isPlaying ? [1, 1.12, 1] : 1,
                    opacity: isPlaying ? [0.55, 0.85, 0.55] : 0.4,
                  }
            }
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-24 right-1/4 w-[460px] h-[460px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(182, 255, 0, 0.16), transparent 70%)',
              willChange: 'transform, opacity',
            }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: isPlaying ? [1.06, 0.96, 1.06] : 1,
                    opacity: isPlaying ? [0.45, 0.72, 0.45] : 0.3,
                  }
            }
            transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      <div
        className={
          isTheaterOpen
            ? 'relative z-10 max-w-6xl mx-auto min-h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-7 flex flex-col justify-between gap-6'
            : 'w-full h-full'
        }
      >
        {/* Top Bar: Minimize, Category Label, Queue & Video Toggle */}
        {isTheaterOpen && (
          <header className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setTheaterOpen(false)}
              aria-label="Minimize music player"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white border border-white/[0.1] bg-[#0F1118] hover:border-[#B6FF00]/50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
            >
              <ChevronDown className="w-5 h-5" />
              <span className="hidden sm:inline">Minimize</span>
            </button>

            <div className="min-w-0 text-center">
              <p className="text-[11px] font-medium text-[#C77DFF] uppercase tracking-wider truncate">
                Playing from
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {categoryName}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentTrack?.provider === 'youtube' && (
                <button
                  type="button"
                  onClick={() => setShowVideoStage((prev) => !prev)}
                  aria-label={showVideoStage ? 'Show album artwork' : 'Show YouTube video'}
                  aria-pressed={showVideoStage}
                  className={`min-h-[44px] px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
                    showVideoStage
                      ? 'bg-[#B6FF00] border-[#B6FF00] text-[#08090D]'
                      : 'border-white/[0.1] bg-[#0F1118] text-[#A1A1AA] hover:text-white hover:border-[#9D4EDD]/50'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {showVideoStage ? 'Artwork' : 'Video'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsQueueOpen((prev) => !prev)}
                aria-label={isQueueOpen ? 'Hide playback queue' : 'Show playback queue'}
                aria-expanded={isQueueOpen}
                className={`min-w-[44px] min-h-[44px] px-3 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
                  isQueueOpen
                    ? 'bg-[#9D4EDD]/20 border-[#9D4EDD]/60 text-[#C77DFF]'
                    : 'border-white/[0.1] bg-[#0F1118] text-[#A1A1AA] hover:text-white hover:border-[#9D4EDD]/50'
                }`}
              >
                <ListMusic className="w-4 h-4" />
                <span className="hidden sm:inline">Queue</span>
              </button>
            </div>
          </header>
        )}

        {/* Main Stage Body (Grid switches smoothly if Queue Drawer is open on desktop) */}
        <div
          className={
            isTheaterOpen
              ? `grid grid-cols-1 ${
                  isQueueOpen
                    ? 'lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] gap-8 items-center'
                    : 'max-w-xl w-full mx-auto'
                } my-auto`
              : 'w-full h-full'
          }
        >
          {/* Left / Centered Player Column */}
          <div
            className={
              isTheaterOpen
                ? 'flex flex-col items-center w-full gap-6 sm:gap-7'
                : 'w-full h-full'
            }
          >
            {/* Centerpiece: Large Centered Artwork + Invariant Provider Host */}
            <div
              className={
                isTheaterOpen
                  ? isVideoVisible
                    ? 'relative w-full max-w-lg'
                    : 'relative w-[250px] h-[250px] sm:w-[320px] sm:h-[320px]'
                  : 'w-full h-full'
              }
            >
              {/* Soft Luminous Halo Behind Artwork */}
              {isTheaterOpen && !isVideoVisible && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 rounded-[36px] blur-2xl transition-opacity duration-500"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(157, 78, 221, 0.38), rgba(182, 255, 0, 0.25))',
                    opacity: isPlaying ? 0.9 : 0.45,
                  }}
                />
              )}

              {/* Large Centered Album Artwork or Clean Empty State */}
              {isTheaterOpen && !isVideoVisible && currentTrack && (
                <motion.div
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0.7, scale: 0.96 }
                  }
                  animate={{ opacity: 1, scale: isPlaying ? 1 : 0.97 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full rounded-3xl overflow-hidden border border-[#9D4EDD]/40 bg-[#0F1118] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]"
                >
                  <ArtworkImage
                    src={currentTrack.artworkUrl}
                    fallbackSrc={currentTrack.fallbackArtwork}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-[#08090D]/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-[#B6FF00]" />
                      <span className="text-xs font-medium text-white">
                        Buffering...
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {isTheaterOpen && !currentTrack && (
                <div className="relative w-full h-full rounded-3xl border border-[#9D4EDD]/35 bg-[#0F1118] flex flex-col items-center justify-center p-6 text-center shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]">
                  <div className="w-16 h-16 rounded-2xl bg-[#9D4EDD]/15 border border-[#9D4EDD]/40 flex items-center justify-center text-[#B6FF00]">
                    <Music2 className="w-8 h-8" />
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold text-white">
                    No song selected
                  </p>
                  <p className="mt-1.5 text-xs text-[#A1A1AA] leading-relaxed">
                    Choose a song from any category or add new tracks in the Admin Panel.
                  </p>
                </div>
              )}

              {/* Invariant Provider Container (NEVER unmounted across views) */}
              <div
                ref={providerContainerRef}
                className={
                  isVideoVisible
                    ? 'relative w-full aspect-video rounded-3xl overflow-hidden border border-[#9D4EDD]/45 bg-black shadow-2xl'
                    : isTheaterOpen
                      ? 'fixed bottom-2 right-2 w-[260px] h-[160px] opacity-0 pointer-events-none -z-10'
                      : 'w-full h-full'
                }
              />
            </div>

            {/* Song Info, Progress Bar, and Full Transport Controls */}
            {isTheaterOpen && currentTrack && (
              <div className="w-full max-w-lg space-y-5">
                {/* Inline Error Recovery Banner */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-amber-200 leading-relaxed">
                        {errorMessage}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            clearError();
                            nextTrack();
                          }}
                          className="text-xs font-semibold text-[#B6FF00] hover:text-white underline underline-offset-2"
                        >
                          Next song
                        </button>
                        {currentTrack.provider === 'youtube' && (
                          <a
                            href={`https://www.youtube.com/watch?v=${currentTrack.providerTrackId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#A1A1AA] hover:text-white inline-flex items-center gap-1"
                          >
                            <span>Open on YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearError}
                      aria-label="Dismiss error"
                      className="p-1 text-[#A1A1AA] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Title, Artist, Category & Favourite */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white truncate tracking-tight">
                      {currentTrack.title}
                    </h2>
                    <p className="mt-1 text-sm sm:text-base text-[#A1A1AA] truncate">
                      {currentTrack.artist}
                    </p>
                    <p className="mt-0.5 text-xs text-[#C77DFF] truncate">
                      {categoryName} · {currentTrack.language}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavourite(currentTrack.id)}
                    aria-label={
                      fav ? 'Remove from favourites' : 'Save to favourites'
                    }
                    className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-2xl border transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
                      fav
                        ? 'text-[#B6FF00] bg-[#B6FF00]/15 border-[#B6FF00]/50'
                        : 'text-[#A1A1AA] hover:text-white border-white/[0.12] bg-[#0F1118]'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${fav ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                {/* Progress Scrubber & Timestamps */}
                <div className="space-y-2">
                  {currentTrack.isLive ? (
                    <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#9D4EDD] via-[#B6FF00] to-[#9D4EDD]" />
                  ) : (
                    <input
                      type="range"
                      aria-label="Seek track position"
                      min={0}
                      max={effectiveDuration || 100}
                      step={1}
                      value={Math.min(currentTime, effectiveDuration || 100)}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #9D4EDD 0%, #B6FF00 ${progressPercent}%, rgba(255,255,255,0.14) ${progressPercent}%, rgba(255,255,255,0.14) 100%)`,
                      }}
                      className="sona-range w-full h-1.5 rounded-full"
                    />
                  )}
                  <div className="flex items-center justify-between font-mono text-xs text-[#A1A1AA] tabular-nums">
                    <span>
                      {currentTrack.isLive ? 'LIVE' : formatTime(currentTime)}
                    </span>
                    <span>
                      {currentTrack.isLive
                        ? 'STREAM'
                        : formatTime(effectiveDuration)}
                    </span>
                  </div>
                </div>

                {/* Main Controls: Shuffle, Previous, Play/Pause, Next, Repeat */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={toggleShuffle}
                    aria-label={shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
                    aria-pressed={shuffleEnabled}
                    className={`min-w-[46px] min-h-[46px] flex items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
                      shuffleEnabled
                        ? 'text-[#C77DFF] bg-[#9D4EDD]/20'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={previousTrack}
                    aria-label="Previous song"
                    className="min-w-[52px] min-h-[52px] flex items-center justify-center rounded-2xl text-white hover:bg-white/[0.08] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
                  >
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-[#B6FF00] hover:brightness-110 text-[#08090D] shadow-[0_14px_35px_-6px_rgba(182,255,0,0.45)] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current translate-x-[1.5px]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={nextTrack}
                    aria-label="Next song"
                    className="min-w-[52px] min-h-[52px] flex items-center justify-center rounded-2xl text-white hover:bg-white/[0.08] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
                  >
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={cycleRepeatMode}
                    aria-label={`Repeat mode: ${repeatMode}`}
                    className={`min-w-[46px] min-h-[46px] flex items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] ${
                      repeatMode !== 'off'
                        ? 'text-[#B6FF00] bg-[#B6FF00]/15'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {repeatMode === 'one' ? (
                      <Repeat1 className="w-5 h-5" />
                    ) : (
                      <Repeat className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Secondary Row: Volume & Quick Close */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2.5 flex-1 max-w-xs">
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#A1A1AA] hover:text-white"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      aria-label="Volume"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #9D4EDD 0%, #B6FF00 ${
                          isMuted ? 0 : volume
                        }%, rgba(255,255,255,0.14) ${
                          isMuted ? 0 : volume
                        }%, rgba(255,255,255,0.14) 100%)`,
                      }}
                      className="sona-range flex-1 h-1 rounded-full"
                    />
                  </div>

                  {currentTrack.provider === 'youtube' && (
                    <a
                      href={`https://www.youtube.com/watch?v=${currentTrack.providerTrackId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white py-2 px-3 rounded-xl hover:bg-white/[0.05] transition-colors shrink-0"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Queue Panel */}
          {isTheaterOpen && isQueueOpen && (
            <div className="rounded-3xl border border-[#9D4EDD]/30 bg-[#0F1118]/90 backdrop-blur-xl p-4 sm:p-5 w-full">
              <div className="flex items-center justify-between gap-3 mb-3.5">
                <div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Up Next Queue
                  </h3>
                  <p className="text-xs text-[#A1A1AA] tabular-nums">
                    {queue.length} {queue.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQueueOpen(false)}
                  aria-label="Close queue panel"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.08]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {queue.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-white">
                    Queue is empty
                  </p>
                  <p className="mt-1 text-xs text-[#A1A1AA]">
                    Songs you play or queue will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06] max-h-[360px] lg:max-h-[460px] overflow-y-auto pr-1">
                  {queue.map((track) => {
                    const active = currentTrack?.id === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() =>
                          playTrack(track, queue, activeCategoryLabel)
                        }
                        className={`w-full flex items-center gap-3 py-2.5 px-2.5 rounded-xl text-left transition-colors ${
                          active
                            ? 'bg-gradient-to-r from-[#9D4EDD]/25 to-[#B6FF00]/12 text-white border border-[#B6FF00]/30'
                            : 'hover:bg-white/[0.05] text-white/90'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/[0.1]">
                          <ArtworkImage
                            src={track.artworkUrl}
                            fallbackSrc={track.fallbackArtwork}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${active ? 'text-[#B6FF00]' : 'text-white'}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-[#A1A1AA] truncate">
                            {track.artist}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-[#A1A1AA] tabular-nums shrink-0">
                          {track.durationLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Spacer on Expanded Overlay */}
        {isTheaterOpen && <div className="h-2" />}
      </div>
    </section>
  );
}
