import { Compass, Play, Trash2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { SectionView } from '../../types/music';
import { TrackList } from '../TrackList';

interface LibraryViewProps {
  mode: 'recent' | 'favourites';
  onNavigate: (section: SectionView) => void;
}

export function LibraryView({ mode, onNavigate }: LibraryViewProps) {
  const {
    recentTracks,
    favouriteTracks,
    playTrack,
    clearRecentHistory,
  } = usePlayer();

  const isRecent = mode === 'recent';
  const tracks = isRecent ? recentTracks : favouriteTracks;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {isRecent ? 'Recently Played' : 'Favourites'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            {isRecent
              ? 'Your recent listening sessions saved locally in this browser.'
              : 'Tracks you hearted across any mood, ready for instant replay.'}
          </p>
        </div>

        {tracks.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => playTrack(tracks[0], tracks)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition-colors whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            {isRecent && (
              <button
                type="button"
                onClick={clearRecentHistory}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-medium text-slate-300 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1018] p-8 sm:p-12 text-center">
          <h2 className="font-display text-xl font-semibold text-white">
            {isRecent
              ? 'No listening history yet'
              : 'No favourite tracks saved yet'}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {isRecent
              ? 'Select any mood and press play to start building your listening timeline.'
              : 'Tap the heart icon on any song while browsing or listening to save it here.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition-colors whitespace-nowrap"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Moods</span>
          </button>
        </div>
      ) : (
        <TrackList tracks={tracks} showMoodName />
      )}
    </div>
  );
}
