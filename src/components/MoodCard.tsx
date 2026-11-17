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
      className={`group relative overflow-hidden rounded-2xl text-left transition-transform duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] active:scale-[0.985] ${
        isSelected
          ? 'ring-2 ring-[#B6FF00] border border-[#B6FF00]/70 bg-[#0F1118]'
          : 'border border-white/[0.08] bg-[#0F1118] hover:border-[#9D4EDD]/60 hover:-translate-y-0.5'
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
            background: `linear-gradient(155deg, ${mood.glowColor} 0%, rgba(15, 17, 24, 0.88) 55%, rgba(8, 9, 13, 0.96) 100%)`,
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
                ? 'bg-[#B6FF00] text-[#08090D] shadow-lg shadow-[#B6FF00]/30'
                : 'bg-white/10 text-white hover:bg-[#B6FF00] hover:text-[#08090D] group-hover:bg-[#B6FF00]/90 group-hover:text-[#08090D]'
            }`}
          >
            <Play className="w-4 h-4 fill-current translate-x-[1px]" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight">
            {mood.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[#A1A1AA] line-clamp-2 leading-relaxed">
            {mood.description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#A1A1AA]">
            <span className="tabular-nums">{trackCount} tracks</span>
            <span aria-hidden="true">·</span>
            <span className={isPlayingThisMood || isSelected ? 'text-[#B6FF00] font-medium' : ''}>
              {isPlayingThisMood ? 'Playing now' : isSelected ? 'Selected' : 'Explore vibe'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
