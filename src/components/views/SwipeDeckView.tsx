import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PanInfo,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  EXPERIENCE_MODES,
  ExperienceCategoryConfig,
  ExperienceMode,
  getCategoriesForMode,
  getExperienceTracks,
} from '../../data/experiences';
import { ArtworkImage } from '../ArtworkImage';

interface SwipeDeckViewProps {
  mode: ExperienceMode;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onBackToModes: () => void;
  onSelectCategory: (category: ExperienceCategoryConfig) => void;
}

function getCircularOffset(index: number, active: number, total: number): number {
  let diff = (index - active + total) % total;
  if (diff > Math.floor(total / 2)) {
    diff -= total;
  }
  return diff;
}

export function SwipeDeckView({
  mode,
  activeIndex,
  onIndexChange,
  onBackToModes,
  onSelectCategory,
}: SwipeDeckViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const { tracks } = usePlayer();
  const categories = getCategoriesForMode(mode);
  const modeMeta = EXPERIENCE_MODES[mode];
  const total = categories.length;
  const safeIndex = ((activeIndex % total) + total) % total;
  const activeCategory = categories[safeIndex];

  const isDraggingRef = useRef(false);
  const dragX = useMotionValue(0);
  const dragRotateZ = useTransform(dragX, [-220, 0, 220], [-8, 0, 8]);
  const dragScale = useTransform(dragX, [-220, 0, 220], [0.97, 1, 0.97]);

  const goNext = useCallback(() => {
    dragX.set(0);
    onIndexChange((safeIndex + 1) % total);
  }, [dragX, onIndexChange, safeIndex, total]);

  const goPrev = useCallback(() => {
    dragX.set(0);
    onIndexChange((safeIndex - 1 + total) % total);
  }, [dragX, onIndexChange, safeIndex, total]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipedLeft = info.offset.x < -60 || info.velocity.x < -360;
    const swipedRight = info.offset.x > 60 || info.velocity.x > 360;

    if (swipedLeft) {
      goNext();
    } else if (swipedRight) {
      goPrev();
    }

    window.setTimeout(() => {
      isDraggingRef.current = false;
    }, 80);
  };

  const formattedIndex = String(safeIndex + 1).padStart(2, '0');
  const formattedTotal = String(total).padStart(2, '0');

  return (
    <div className="min-h-[calc(100vh-220px)] flex flex-col justify-between py-2 sm:py-4 overflow-x-hidden">
      {/* Top Bar: Back to Experience Modes + Progress Indicator */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToModes}
          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.1] bg-[#101426]/90 hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Experiences</span>
        </button>

        <div className="text-center">
          <p className="text-xs font-medium text-[#A78BFA]">{modeMeta.title}</p>
          <p className="text-xs text-slate-400 hidden sm:block">
            Swipe or tap a card to begin
          </p>
        </div>

        <div className="min-w-[72px] text-right font-mono text-sm font-medium text-slate-200 tabular-nums">
          <span className="text-white">{formattedIndex}</span>
          <span className="text-slate-500 mx-1">/</span>
          <span className="text-slate-400">{formattedTotal}</span>
        </div>
      </div>

      {/* 3D Stacked Swipeable Card Carousel */}
      <div
        className="relative flex-1 flex items-center justify-center my-6 sm:my-8 min-h-[430px] sm:min-h-[500px]"
        style={{ perspective: '1200px' }}
      >
        {/* Ambient Glow Driven by Foreground Card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full blur-3xl transition-colors duration-500"
          style={{ background: activeCategory.glowColor }}
        />

        <div className="relative w-[min(82vw,340px)] sm:w-[390px] lg:w-[410px] h-[420px] sm:h-[480px] flex items-center justify-center">
          {categories.map((category, idx) => {
            const rel = getCircularOffset(idx, safeIndex, total);
            const isForeground = rel === 0;
            const isVisibleInStack = rel >= -1 && rel <= 2;

            if (!isVisibleInStack) return null;

            const trackCount = getExperienceTracks(category, tracks, 'All').length;

            // 3D stacked card depth transforms
            let targetX = 0;
            let targetY = 0;
            let targetScale = 1;
            let targetRotateZ = 0;
            let targetRotateY = 0;
            let targetOpacity = 1;
            let zIndex = 30;

            if (rel === 1) {
              targetX = 38;
              targetY = 12;
              targetScale = 0.92;
              targetRotateZ = 3.5;
              targetRotateY = -6;
              targetOpacity = 0.82;
              zIndex = 20;
            } else if (rel === 2) {
              targetX = 72;
              targetY = 24;
              targetScale = 0.84;
              targetRotateZ = 6.5;
              targetRotateY = -10;
              targetOpacity = 0.5;
              zIndex = 10;
            } else if (rel === -1) {
              targetX = -34;
              targetY = 14;
              targetScale = 0.9;
              targetRotateZ = -3.5;
              targetRotateY = 6;
              targetOpacity = 0.42;
              zIndex = 15;
            }

            return (
              <motion.div
                key={category.id}
                style={{
                  zIndex,
                  x: isForeground ? dragX : undefined,
                  rotateZ: isForeground ? dragRotateZ : undefined,
                  scale: isForeground ? dragScale : undefined,
                  transformStyle: 'preserve-3d',
                  touchAction: isForeground ? 'pan-y' : 'auto',
                }}
                initial={false}
                animate={
                  prefersReducedMotion
                    ? {
                        x: targetX,
                        y: targetY,
                        scale: targetScale,
                        opacity: targetOpacity,
                      }
                    : {
                        x: targetX,
                        y: targetY,
                        scale: targetScale,
                        rotateZ: targetRotateZ,
                        rotateY: targetRotateY,
                        opacity: targetOpacity,
                      }
                }
                transition={{
                  type: 'spring',
                  stiffness: 290,
                  damping: 27,
                  mass: 0.9,
                }}
                drag={isForeground ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.48}
                dragSnapToOrigin
                onDragStart={isForeground ? handleDragStart : undefined}
                onDragEnd={isForeground ? handleDragEnd : undefined}
                whileDrag={isForeground ? { cursor: 'grabbing' } : undefined}
                onClick={() => {
                  if (isForeground) {
                    if (!isDraggingRef.current) {
                      onSelectCategory(category);
                    }
                  } else {
                    onIndexChange(idx);
                  }
                }}
                role="button"
                tabIndex={isForeground ? 0 : -1}
                aria-label={
                  isForeground
                    ? `Open ${category.title}: ${category.description}`
                    : `Preview ${category.title}`
                }
                onKeyDown={(e) => {
                  if (isForeground && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectCategory(category);
                  }
                }}
                className={`absolute inset-0 rounded-3xl overflow-hidden bg-[#101426] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF] ${
                  isForeground
                    ? 'cursor-grab active:cursor-grabbing border border-white/20 shadow-[0_28px_70px_-15px_rgba(16,20,38,0.95),0_0_40px_-10px_rgba(53,107,255,0.4)]'
                    : 'cursor-pointer border border-white/10 shadow-2xl'
                }`}
              >
                {/* Card Artwork */}
                <div className="absolute inset-0">
                  <ArtworkImage
                    src={category.coverImage}
                    alt={`${category.title} atmosphere`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, ${category.glowColor} 0%, rgba(16, 20, 38, 0.35) 38%, rgba(16, 20, 38, 0.95) 88%, #101426 100%)`,
                    }}
                  />
                </div>

                {/* Top Subtle Index & Track Count */}
                <div className="relative z-10 p-6 sm:p-7 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-200/90">
                    <span className="font-mono tabular-nums text-white/80">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="tabular-nums text-slate-200/85">
                      {trackCount} tracks
                    </span>
                  </div>

                  {/* Category Title, Description & Action Prompt */}
                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {category.title}
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-slate-200/90 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-white/[0.12] flex items-center justify-between text-xs sm:text-sm font-medium text-white">
                      <span className="text-[#A78BFA]">
                        {isForeground ? 'Tap card to listen' : 'Bring forward'}
                      </span>
                      <span className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#356BFF] to-[#A78BFA] flex items-center justify-center shadow-md shadow-[#356BFF]/30">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls: Prev / Next + Dot Indicators + Open CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous category card"
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.12] bg-[#101426] text-slate-200 hover:text-white hover:border-[#356BFF]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Compact Progress Dots */}
          <div className="flex items-center gap-2 px-2" aria-hidden="true">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                tabIndex={-1}
                onClick={() => onIndexChange(idx)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  idx === safeIndex
                    ? 'w-6 bg-gradient-to-r from-[#356BFF] to-[#A78BFA]'
                    : 'w-2 bg-white/20 hover:bg-white/35'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next category card"
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.12] bg-[#101426] text-slate-200 hover:text-white hover:border-[#356BFF]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory(activeCategory)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#356BFF] to-[#A78BFA] hover:brightness-110 shadow-lg shadow-[#356BFF]/25 transition-all active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356BFF]"
        >
          <span>Open {activeCategory.title}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
