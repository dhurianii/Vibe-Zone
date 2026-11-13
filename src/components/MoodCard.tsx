import { Play } from 'lucide-react';
import { MoodCategory } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

interface MoodCardProps {
  mood: MoodCategory;
  trackCount: number;
  isSelected: boolean;
  isPlayingThisMood: boolean;
  onSelect: (moodId: MoodCategory['id']) => void;
  onPlayMood: (moodId: MoodCategory['id']) => void;
}

export function MoodCard({
  mood,
  trackCount,
  isSelected,
  isPlayingThisMood,
  onSelect,
  onPlayMood,
}: MoodCardProps) {
  return (
    <div
      onClick={() => onSelect(mood.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(mood.id);
        }
      }}
      aria-pressed={isSelected}
      className={`group relative overflow-hidden rounded-2xl text-left transition-transform duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-[0.985] ${
        isSelected
          ? 'ring-2 ring-indigo-500 border border-indigo-400/50 bg-[#141827]'
          : 'border border-white/[0.08] bg-[#10131C] hover:border-white/[0.18] hover:-translate-y-0.5'
      }`}
    >
      {/* Background Cover Artwork with measured contrast scrim */}
      <div className="absolute inset-0">
        <ArtworkImage
          src={mood.coverImage}
          alt={`${mood.name} atmosphere`}
          className="w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-300"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(155deg, ${mood.glowColor} 0%, rgba(10, 12, 19, 0.88) 55%, rgba(7, 8, 11, 0.96) 100%)`,
          }}
        />
      </div>

      {/* Card Content */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between min-h-[154px] sm:min-h-[168px]">
        <div className="flex items-start justify-between gap-3">
          <span
            className="text-2xl sm:text-3xl leading-none select-none"
            aria-hidden="true"
          >
            {mood.emoji}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayMood(mood.id);
            }}
            aria-label={`Play ${mood.name} mood`}
            className={`min-w-[40px] min-h-[40px] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isPlayingThisMood
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/10 text-white hover:bg-indigo-500 group-hover:bg-indigo-500/90'
            }`}
          >
            <Play className="w-4 h-4 fill-current translate-x-[1px]" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight">
            {mood.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-300/85 line-clamp-2 leading-relaxed">
            {mood.description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="tabular-nums">{trackCount} tracks</span>
            <span aria-hidden="true">·</span>
            <span>{isPlayingThisMood ? 'Playing now' : isSelected ? 'Selected' : 'Explore vibe'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
