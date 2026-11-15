import {
  ExternalLink,
  Heart,
  ListEnd,
  ListPlus,
  MoreVertical,
  Pause,
  Play,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

interface TrackListProps {
  tracks: Track[];
  showMoodName?: boolean;
  categoryLabel?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TrackList({
  tracks,
  showMoodName = false,
  categoryLabel,
  emptyTitle = 'No tracks found',
  emptyDescription = 'Try selecting another mood or clearing your search filter.',
}: TrackListProps) {
  const {
    currentTrack,
    status,
    getMood,
    playTrack,
    togglePlayPause,
    toggleFavourite,
    isFavourite,
    playNextInQueue,
    addToQueue,
  } = usePlayer();

  const [openMenuTrackId, setOpenMenuTrackId] = useState<string | null>(null);
  const [feedbackTrackId, setFeedbackTrackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMenuTrackId) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenMenuTrackId(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuTrackId(null);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuTrackId]);

  const showRowFeedback = (trackId: string, text: string) => {
    setFeedbackTrackId(trackId);
    setFeedbackText(text);
    window.setTimeout(() => {
      setFeedbackTrackId((prev) => (prev === trackId ? null : prev));
    }, 1800);
  };

  if (tracks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#101426]/90 p-8 sm:p-12 text-center">
        <p className="font-display text-lg font-semibold text-white">
          {emptyTitle}
        </p>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-white/[0.09] bg-[#101426]/85 divide-y divide-white/[0.06]"
    >
      {tracks.map((track, index) => {
        const isCurrent = currentTrack?.id === track.id;
        const isPending = track.provider === 'pending';
        const isPlaying =
          isCurrent && (status === 'playing' || status === 'loading');
        const fav = isFavourite(track.id);
        const mood = getMood(track.moodId);
        const isMenuOpen = openMenuTrackId === track.id;
        const rowFeedback = feedbackTrackId === track.id ? feedbackText : null;

        const handleRowPlayToggle = () => {
          if (isCurrent) {
            togglePlayPause();
          } else {
            playTrack(track, tracks, categoryLabel);
          }
        };

        return (
          <div
            key={track.id}
            onClick={handleRowPlayToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRowPlayToggle();
              }
            }}
            className={`group relative flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3 sm:py-3.5 transition-all duration-150 cursor-pointer first:rounded-t-2xl last:rounded-b-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#356BFF] ${
              isCurrent
                ? 'bg-gradient-to-r from-[#356BFF]/18 via-[#A78BFA]/10 to-transparent'
                : 'hover:bg-white/[0.04]'
            }`}
          >
            {/* Track Number / Active Equalizer */}
            <div className="hidden sm:flex w-7 shrink-0 items-center justify-center">
              {isPlaying ? (
                <div
                  aria-label="Playing"
                  className="flex items-end gap-[2.5px] h-3.5"
                >
                  <span className="w-[3px] h-full rounded-full bg-[#356BFF] animate-pulse" />
                  <span
                    className="w-[3px] h-2.5 rounded-full bg-[#A78BFA] animate-pulse"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-[3px] h-3 rounded-full bg-[#356BFF] animate-pulse"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              ) : (
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isCurrent
                      ? 'text-[#A78BFA] font-semibold'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Artwork */}
            <div
              className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border transition-colors ${
                isCurrent
                  ? 'border-[#356BFF]/70 shadow-md shadow-[#356BFF]/25'
                  : 'border-white/[0.1] bg-[#161B30]'
              }`}
            >
              <ArtworkImage
                src={track.artworkUrl}
                fallbackSrc={track.fallbackArtwork}
                alt={`${track.title} artwork`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Song Title & Artist Metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <p
                  className={`text-sm sm:text-[15px] font-semibold truncate ${
                    isCurrent
                      ? 'text-white'
                      : isPending
                        ? 'text-slate-300'
                        : 'text-slate-100 group-hover:text-white'
                  }`}
                >
                  {track.title}
                </p>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 truncate">
                <span className="truncate text-slate-300/90">
                  {track.artist}
                </span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0 text-slate-400">
                  {track.language}
                </span>
                {track.album && (
                  <>
                    <span aria-hidden="true" className="hidden md:inline">
                      ·
                    </span>
                    <span className="hidden md:inline truncate text-slate-400/90">
                      {track.album}
                    </span>
                  </>
                )}
                {showMoodName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0 text-slate-300/90">
                      {mood.emoji} {mood.name}
                    </span>
                  </>
                )}
              </div>
              {rowFeedback && (
                <p className="mt-1 text-[11px] font-medium text-[#A78BFA]">
                  {rowFeedback}
                </p>
              )}
            </div>

            {/* Duration / Status */}
            <div className="hidden xs:block sm:block text-right shrink-0">
              <span
                className={`font-mono text-xs tabular-nums ${
                  isPending
                    ? 'text-amber-300/90 font-sans font-medium'
                    : track.isLive
                      ? 'text-[#356BFF] font-medium'
                      : isCurrent
                        ? 'text-[#A78BFA] font-medium'
                        : 'text-slate-400'
                }`}
              >
                {isPending ? 'Source Pending' : track.durationLabel}
              </span>
            </div>

            {/* Row Actions: Play/Pause, Favourite, More Options */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowPlayToggle();
                }}
                disabled={isPending}
                aria-label={
                  isPlaying
                    ? `Pause ${track.title}`
                    : `Play ${track.title}`
                }
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF] disabled:opacity-40 disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#356BFF] to-[#A78BFA] text-white shadow-md shadow-[#356BFF]/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-[0.5px]" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(track.id);
                }}
                aria-label={
                  fav
                    ? `Remove ${track.title} from favourites`
                    : `Save ${track.title} to favourites`
                }
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF] ${
                  fav
                    ? 'text-[#A78BFA] hover:text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuTrackId(isMenuOpen ? null : track.id);
                  }}
                  aria-label={`More options for ${track.title}`}
                  aria-expanded={isMenuOpen}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF] ${
                    isMenuOpen
                      ? 'bg-white/[0.1] text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div
                    role="menu"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 z-30 w-52 rounded-2xl border border-white/[0.12] bg-[#141933]/98 backdrop-blur-xl shadow-2xl p-1.5 text-left"
                  >
                    {!isPending && (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            playNextInQueue(track);
                            setOpenMenuTrackId(null);
                            showRowFeedback(track.id, 'Playing next in queue');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                        >
                          <ListPlus className="w-4 h-4 text-[#356BFF]" />
                          <span>Play Next</span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            addToQueue(track);
                            setOpenMenuTrackId(null);
                            showRowFeedback(track.id, 'Added to queue');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                        >
                          <ListEnd className="w-4 h-4 text-[#A78BFA]" />
                          <span>Add to Queue</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        toggleFavourite(track.id);
                        setOpenMenuTrackId(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          fav ? 'fill-current text-[#A78BFA]' : 'text-slate-400'
                        }`}
                      />
                      <span>
                        {fav ? 'Remove from Favourites' : 'Save to Favourites'}
                      </span>
                    </button>

                    {track.provider === 'youtube' && track.providerTrackId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${track.providerTrackId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        onClick={() => setOpenMenuTrackId(null)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        <span>Open on YouTube</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
