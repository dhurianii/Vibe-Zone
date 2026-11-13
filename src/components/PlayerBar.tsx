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
  } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  const mood = getMood(currentTrack.moodId);
  const fav = isFavourite(currentTrack.id);
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  const effectiveDuration = duration > 0 ? duration : currentTrack.durationSeconds;
  const progressPercent =
    !currentTrack.isLive && effectiveDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))
      : 0;

  return (
    <>
      {/* Playback Error Notice */}
      {errorMessage && (
        <div
          role="alert"
          className="fixed bottom-[112px] md:bottom-[92px] left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 rounded-xl border border-amber-500/30 bg-[#141218]/95 backdrop-blur-xl px-4 py-3 shadow-2xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-amber-200">
              {errorMessage}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  nextTrack();
                }}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
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

      {/* Mobile Compact Mini-Player (sits directly above 52px mobile nav) */}
      <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-40 bg-[#10131D]/95 backdrop-blur-xl border-t border-white/[0.08]">
        {/* Top micro progress bar */}
        <div className="h-[2px] w-full bg-white/[0.08]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-[width] duration-200"
            style={{ width: currentTrack.isLive ? '100%' : `${progressPercent}%` }}
          />
        </div>

        <div className="h-[54px] px-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setTheaterOpen(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/[0.08]">
              <ArtworkImage
                src={currentTrack.artworkUrl}
                fallbackSrc={currentTrack.fallbackArtwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentTrack.artist} · {mood.emoji} {mood.name}
              </p>
            </div>
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => toggleFavourite(currentTrack.id)}
              aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl ${
                fav ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-white"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              aria-label="Next track"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-300"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop & Tablet Full Persistent Player Bar */}
      <footer
        aria-label="Music player controls"
        className="hidden md:block fixed bottom-0 left-0 right-0 z-40 h-[84px] border-t border-white/[0.08] bg-[#0B0D14]/95 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-8 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-6">
          {/* Left: Track Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => setTheaterOpen(!isTheaterOpen)}
              aria-label="Toggle video and now playing stage"
              className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/[0.1] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <ArtworkImage
                src={currentTrack.artworkUrl}
                fallbackSrc={currentTrack.fallbackArtwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </button>

            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setTheaterOpen(true)}
                className="block w-full text-left text-sm font-semibold text-white hover:text-indigo-300 transition-colors truncate"
              >
                {currentTrack.title}
              </button>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {currentTrack.artist} · {mood.emoji} {mood.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleFavourite(currentTrack.id)}
              aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors ${
                fav
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center: Transport & Scrubber */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={previousTrack}
                aria-label="Previous track"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white shadow-lg shadow-indigo-950/50 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            <div className="w-full max-w-md flex items-center gap-2.5">
              <span className="font-mono text-[11px] text-slate-400 tabular-nums w-11 text-right shrink-0">
                {currentTrack.isLive ? 'LIVE' : formatTime(currentTime)}
              </span>

              {currentTrack.isLive ? (
                <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 opacity-85" />
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
                    background: `linear-gradient(to right, #6366F1 0%, #3B82F6 ${progressPercent}%, rgba(255,255,255,0.12) ${progressPercent}%, rgba(255,255,255,0.12) 100%)`,
                  }}
                  className="sona-range flex-1 h-1 rounded-full"
                />
              )}

              <span className="font-mono text-[11px] text-slate-400 tabular-nums w-11 shrink-0">
                {currentTrack.isLive
                  ? 'STREAM'
                  : formatTime(effectiveDuration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Stage Expand */}
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
                background: `linear-gradient(to right, #6366F1 0%, #3B82F6 ${
                  isMuted ? 0 : volume
                }%, rgba(255,255,255,0.14) ${
                  isMuted ? 0 : volume
                }%, rgba(255,255,255,0.14) 100%)`,
              }}
              className="sona-range w-24 h-1 rounded-full"
            />

            <button
              type="button"
              onClick={() => setTheaterOpen(!isTheaterOpen)}
              aria-label="Open full player stage"
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl text-xs font-medium border border-white/[0.1] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Stage</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
