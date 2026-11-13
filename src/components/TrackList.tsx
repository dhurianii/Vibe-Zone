import { Heart, Pause, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

interface TrackListProps {
  tracks: Track[];
  showMoodName?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TrackList({
  tracks,
  showMoodName = false,
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
  } = usePlayer();

  if (tracks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0D1018] p-8 sm:p-12 text-center">
        <p className="font-display text-lg font-semibold text-slate-100">
          {emptyTitle}
        </p>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0C0F17]/90 divide-y divide-white/[0.06] overflow-hidden">
      {tracks.map((track, index) => {
        const isCurrent = currentTrack?.id === track.id;
        const isPlaying = isCurrent && (status === 'playing' || status === 'loading');
        const fav = isFavourite(track.id);
        const mood = getMood(track.moodId);

        return (
          <div
            key={track.id}
            onClick={() => {
              if (isCurrent) {
                togglePlayPause();
              } else {
                playTrack(track, tracks);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isCurrent) {
                  togglePlayPause();
                } else {
                  playTrack(track, tracks);
                }
              }
            }}
            className={`group flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3 sm:py-3.5 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 ${
              isCurrent
                ? 'bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-transparent'
                : 'hover:bg-white/[0.035]'
            }`}
          >
            {/* Track Index / Play State */}
            <div className="w-7 shrink-0 flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-indigo-400 fill-current" />
              ) : (
                <>
                  <span
                    className={`font-mono text-xs tabular-nums group-hover:hidden ${
                      isCurrent ? 'text-indigo-400 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Play className="w-4 h-4 text-white fill-current hidden group-hover:block" />
                </>
              )}
            </div>

            {/* Artwork */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/[0.08] bg-[#141724]">
              <ArtworkImage
                src={track.artworkUrl}
                fallbackSrc={track.fallbackArtwork}
                alt={`${track.title} artwork`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Artist */}
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm sm:text-[15px] font-medium truncate ${
                  isCurrent ? 'text-indigo-300' : 'text-slate-100'
                }`}
              >
                {track.title}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 truncate">
                <span className="truncate">{track.artist}</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0 text-slate-300/85">
                  {track.language}
                </span>
                {showMoodName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0 text-slate-300/90">
                      {mood.emoji} {mood.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Duration / Live */}
            <div className="hidden xs:block sm:block text-right shrink-0">
              <span
                className={`font-mono text-xs tabular-nums ${
                  track.isLive ? 'text-blue-400 font-medium' : 'text-slate-400'
                }`}
              >
                {track.durationLabel}
              </span>
            </div>

            {/* Favourite Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavourite(track.id);
              }}
              aria-label={fav ? `Remove ${track.title} from favourites` : `Save ${track.title} to favourites`}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                fav
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
