import {
  AlertCircle,
  ChevronUp,
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
  X,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';
import { ArtworkImage } from './ArtworkImage';

export function PlayerBar() {
  const {
    currentTrack,
    status,
    currentTime,
    duration,
    volume,
    isMuted,
    errorMessage,
    isTheaterOpen,
    setTheaterOpen,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleFavourite,
    isFavourite,
    clearError,
    getMood,
    activeCategoryLabel,
  } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  const mood = getMood(currentTrack.moodId);
  const categoryDisplay = activeCategoryLabel || mood.name;
  const fav = isFavourite(currentTrack.id);
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  const effectiveDuration =
    duration > 0 ? duration : currentTrack.durationSeconds;
  const progressPercent =
    !currentTrack.isLive && effectiveDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))
      : 0;

  return (
    <>
      {/* Playback Error Notice */}
      {errorMessage && !isTheaterOpen && (
        <div
          role="alert"
          className="fixed bottom-[118px] md:bottom-[94px] left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 rounded-2xl border border-amber-500/35 bg-[#101426]/95 backdrop-blur-xl px-4 py-3 shadow-2xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-amber-200 leading-relaxed">
              {errorMessage}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  nextTrack();
                }}
                className="text-xs font-semibold text-[#A78BFA] hover:text-white underline underline-offset-2"
              >
                Skip to next track
              </button>
              {currentTrack.provider === 'youtube' && (
                <a
                  href={`https://www.youtube.com/watch?v=${currentTrack.providerTrackId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={clearError}
            aria-label="Dismiss playback notice"
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Persistent Mini-Player (sits directly above 52px mobile bottom nav) */}
      <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-40 bg-[#101426]/95 backdrop-blur-2xl border-t border-white/[0.1] shadow-[0_-10px_30px_rgba(8,10,22,0.75)]">
        {/* Sleek Top Progress Indicator */}
        <div className="h-[3px] w-full bg-white/[0.08]">
          <div
            className="h-full bg-gradient-to-r from-[#356BFF] to-[#A78BFA] transition-[width] duration-200"
            style={{
              width: currentTrack.isLive ? '100%' : `${progressPercent}%`,
            }}
          />
        </div>

        <div className="h-[56px] px-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setTheaterOpen(true)}
            aria-label={`Open full player for ${currentTrack.title}`}
            className="flex items-center gap-3 min-w-0 flex-1 text-left py-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
          >
            <div
              className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border ${
                isPlaying
                  ? 'border-[#356BFF]/70 shadow-sm shadow-[#356BFF]/30'
                  : 'border-white/[0.12]'
              }`}
            >
              <ArtworkImage
                src={currentTrack.artworkUrl}
                fallbackSrc={currentTrack.fallbackArtwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-[11px] text-slate-300/80 truncate">
                {currentTrack.artist}
              </p>
            </div>

            <ChevronUp className="w-4 h-4 text-[#A78BFA] shrink-0" />
          </button>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gradient-to-r from-[#356BFF] to-[#A78BFA] text-white shadow-md shadow-[#356BFF]/25 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-[0.5px]" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              aria-label="Next track"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-200 hover:text-white active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop & Tablet Persistent Mini-Player */}
      <footer
        aria-label="Music mini player"
        className="hidden md:block fixed bottom-0 left-0 right-0 z-40 h-[84px] border-t border-white/[0.1] bg-[#101426]/95 backdrop-blur-2xl shadow-[0_-12px_40px_rgba(6,8,18,0.8)]"
      >
        {/* Subtle Full-Width Top Progress Track */}
        <div className="h-[2px] w-full bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-[#356BFF] to-[#A78BFA] transition-[width] duration-200"
            style={{
              width: currentTrack.isLive ? '100%' : `${progressPercent}%`,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto h-[82px] px-6 lg:px-8 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-6">
          {/* Left: Artwork, Title, Artist & Expand Trigger */}
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => setTheaterOpen(true)}
              aria-label={`Expand music player for ${currentTrack.title}`}
              className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF] ${
                isPlaying
                  ? 'border-[#356BFF]/75 shadow-md shadow-[#356BFF]/25'
                  : 'border-white/[0.12]'
              }`}
            >
              <ArtworkImage
                src={currentTrack.artworkUrl}
                fallbackSrc={currentTrack.fallbackArtwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </button>

            <button
              type="button"
              onClick={() => setTheaterOpen(true)}
              className="min-w-0 flex-1 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF] rounded-lg py-1"
            >
              <p className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-slate-300/80 truncate mt-0.5">
                {currentTrack.artist} · {categoryDisplay}
              </p>
            </button>

            <button
              type="button"
              onClick={() => toggleFavourite(currentTrack.id)}
              aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors ${
                fav
                  ? 'text-[#A78BFA] hover:text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center: Synchronized Transport & Progress Bar */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={previousTrack}
                aria-label="Previous track"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#356BFF] to-[#A78BFA] hover:brightness-110 text-white shadow-lg shadow-[#356BFF]/30 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                )}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                aria-label="Next track"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            <div className="w-full max-w-md flex items-center gap-2.5">
              <span className="font-mono text-[11px] text-slate-300/80 tabular-nums w-11 text-right shrink-0">
                {currentTrack.isLive ? 'LIVE' : formatTime(currentTime)}
              </span>

              {currentTrack.isLive ? (
                <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#356BFF] via-[#A78BFA] to-[#356BFF] opacity-90" />
              ) : (
                <input
                  type="range"
                  aria-label="Playback progress"
                  min={0}
                  max={effectiveDuration || 100}
                  step={1}
                  value={Math.min(currentTime, effectiveDuration || 100)}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #356BFF 0%, #A78BFA ${progressPercent}%, rgba(255,255,255,0.14) ${progressPercent}%, rgba(255,255,255,0.14) 100%)`,
                  }}
                  className="sona-range flex-1 h-1 rounded-full"
                />
              )}

              <span className="font-mono text-[11px] text-slate-300/80 tabular-nums w-11 shrink-0">
                {currentTrack.isLive
                  ? 'STREAM'
                  : formatTime(effectiveDuration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Open Expanded Player */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white transition-colors"
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
                background: `linear-gradient(to right, #356BFF 0%, #A78BFA ${
                  isMuted ? 0 : volume
                }%, rgba(255,255,255,0.14) ${
                  isMuted ? 0 : volume
                }%, rgba(255,255,255,0.14) 100%)`,
              }}
              className="sona-range w-24 h-1 rounded-full"
            />

            <button
              type="button"
              onClick={() => setTheaterOpen(true)}
              aria-label="Open expanded music player"
              className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium border border-white/[0.12] bg-white/[0.06] text-white hover:bg-[#356BFF]/25 hover:border-[#356BFF]/60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Player</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
