import {
  ChevronDown,
  ExternalLink,
  Heart,
  Loader2,
  Maximize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';
import { ArtworkImage } from './ArtworkImage';

/**
 * Single persistent YouTube IFrame Player Stage.
 * Never unmounts the YouTube IFrame container so playback remains seamless
 * when toggling between compact docked stage and full Theater View.
 */
export function PlayerStage() {
  const {
    currentTrack,
    queue,
    status,
    currentTime,
    duration,
    volume,
    isMuted,
    isTheaterOpen,
    setTheaterOpen,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleFavourite,
    isFavourite,
    providerContainerRef,
    activeProviderName,
    getMood,
  } = usePlayer();

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
  const effectiveDuration =
    duration > 0 ? duration : currentTrack?.durationSeconds ?? 0;
  const progressPercent =
    currentTrack && !currentTrack.isLive && effectiveDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))
      : 0;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const fav = currentTrack ? isFavourite(currentTrack.id) : false;

  return (
    <section
      aria-label="Active playback stage"
      className={
        isTheaterOpen
          ? 'fixed inset-0 z-50 bg-[#05060A]/95 backdrop-blur-2xl overflow-y-auto'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8'
      }
    >
      <div
        className={
          isTheaterOpen
            ? 'max-w-6xl mx-auto min-h-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col justify-between gap-6'
            : 'rounded-2xl border border-white/[0.08] bg-[#0B0E16] p-4 sm:p-6'
        }
      >
        {/* Header Bar when Theater is Open vs Inline Dock Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-indigo-400">
              {activeProviderName}
              {activeMood ? ` · ${activeMood.emoji} ${activeMood.name}` : ''}
            </p>
            <h2 className="font-display text-base sm:text-lg font-semibold text-white truncate mt-0.5">
              {currentTrack
                ? currentTrack.title
                : 'Select a mood or track to begin listening'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentTrack && currentTrack.provider === 'youtube' && (
              <a
                href={`https://www.youtube.com/watch?v=${currentTrack.providerTrackId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-xs font-medium text-slate-300 hover:text-white border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-colors whitespace-nowrap"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {isTheaterOpen ? (
              <button
                type="button"
                onClick={() => setTheaterOpen(false)}
                aria-label="Minimize player stage"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium text-white bg-white/10 hover:bg-white/15 transition-colors whitespace-nowrap"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Minimize</span>
              </button>
            ) : (
              currentTrack && (
                <button
                  type="button"
                  onClick={() => setTheaterOpen(true)}
                  aria-label="Expand full theater view"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium text-white bg-indigo-600/90 hover:bg-indigo-500 transition-colors whitespace-nowrap"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expand Stage</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Main Content Grid: Persistent YouTube IFrame + Controls / Queue */}
        <div
          className={
            isTheaterOpen
              ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start my-auto'
              : 'mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-5'
          }
        >
          {/* Persistent YouTube IFrame Wrapper (>= 280x200 always compliant with YouTube policy) */}
          <div
            className={
              isTheaterOpen
                ? 'w-full space-y-5'
                : 'w-full sm:w-[320px] shrink-0'
            }
          >
            <div
              className={`relative overflow-hidden rounded-2xl border border-white/[0.1] bg-black ${
                isTheaterOpen
                  ? 'w-full aspect-video min-h-[220px]'
                  : 'w-full h-[200px]'
              }`}
            >
              <div ref={providerContainerRef} className="w-full h-full" />

              {!currentTrack && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090B12]/90 px-4 text-center pointer-events-none">
                  <p className="font-display text-sm font-semibold text-slate-200">
                    Official Playback Stage Ready
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Pick any mood card or track to start playback.
                  </p>
                </div>
              )}

              {currentTrack && currentTrack.provider === 'audio' && (
                <div className="absolute inset-0 bg-[#090B12] flex items-center justify-center">
                  <ArtworkImage
                    src={currentTrack.artworkUrl}
                    fallbackSrc={currentTrack.fallbackArtwork}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-medium text-indigo-300">
                      Authorized Audio Stream
                    </p>
                    <p className="text-sm font-semibold text-white truncate">
                      {currentTrack.title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Full Transport Controls inside Theater Mode */}
            {isTheaterOpen && currentTrack && (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0D1019] p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white truncate">
                      {currentTrack.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5 truncate">
                      {currentTrack.artist}
                      {activeMood ? ` · ${activeMood.emoji} ${activeMood.name}` : ''}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavourite(currentTrack.id)}
                    aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-white/[0.08] transition-colors ${
                      fav
                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-400/30'
                        : 'text-slate-300 hover:text-white bg-white/[0.03]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Seek Bar */}
                <div className="space-y-1.5">
                  {currentTrack.isLive ? (
                    <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500" />
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
                        background: `linear-gradient(to right, #6366F1 0%, #3B82F6 ${progressPercent}%, rgba(255,255,255,0.12) ${progressPercent}%, rgba(255,255,255,0.12) 100%)`,
                      }}
                      className="sona-range w-full h-1.5 rounded-full"
                    />
                  )}
                  <div className="flex items-center justify-between font-mono text-xs text-slate-400 tabular-nums">
                    <span>
                      {currentTrack.isLive ? 'LIVE' : formatTime(currentTime)}
                    </span>
                    <span>
                      {currentTrack.isLive
                        ? '24/7 STREAM'
                        : formatTime(effectiveDuration)}
                    </span>
                  </div>
                </div>

                {/* Buttons + Volume */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={previousTrack}
                      aria-label="Previous track"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors"
                    >
                      <SkipBack className="w-5 h-5 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white shadow-lg shadow-indigo-950/60 transition-transform active:scale-95"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current translate-x-[1px]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={nextTrack}
                      aria-label="Next track"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors"
                    >
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
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
                        background: `linear-gradient(to right, #6366F1 0%, #3B82F6 ${
                          isMuted ? 0 : volume
                        }%, rgba(255,255,255,0.14) ${
                          isMuted ? 0 : volume
                        }%, rgba(255,255,255,0.14) 100%)`,
                      }}
                      className="sona-range w-28 sm:w-32 h-1 rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side: Queue list in Theater mode, or calm summary when inline */}
          {isTheaterOpen ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0D1019] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-base font-semibold text-white">
                  Mood Queue
                </h3>
                <span className="text-xs text-slate-400 tabular-nums">
                  {queue.length} tracks
                </span>
              </div>
              <div className="divide-y divide-white/[0.06] max-h-[420px] overflow-y-auto pr-1">
                {queue.map((track) => {
                  const active = currentTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => playTrack(track, queue)}
                      className={`w-full flex items-center gap-3 py-2.5 px-2.5 rounded-xl text-left transition-colors ${
                        active
                          ? 'bg-indigo-500/15 text-indigo-200'
                          : 'hover:bg-white/[0.04] text-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/[0.08]">
                        <ArtworkImage
                          src={track.artworkUrl}
                          fallbackSrc={track.fallbackArtwork}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
                        {track.durationLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-medium text-indigo-300">
                Official YouTube Playback
              </p>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                {currentTrack
                  ? `Now streaming "${currentTrack.title}" by ${currentTrack.artist} via the official YouTube IFrame Player API.`
                  : 'Playback runs directly through the official YouTube IFrame Player API with modular provider isolation for future music services.'}
              </p>
              {currentTrack && (
                <p className="text-xs text-slate-400">
                  Use the player bar below on desktop, or tap the mini-player on mobile to open full controls and queue.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
