import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { EXPERIENCE_MODES, ExperienceMode } from '../../data/experiences';
import { SectionView } from '../../types/music';
import { ArtworkImage } from '../ArtworkImage';

interface ExperienceHomeViewProps {
  onSelectMode: (mode: ExperienceMode) => void;
  onNavigate: (section: SectionView) => void;
}

const FEEL_PARTICLES = [
  { id: 1, x: '16%', y: '24%', size: 5, delay: 0, dur: 4.4, color: '#9D4EDD' },
  { id: 2, x: '34%', y: '18%', size: 4, delay: 0.6, dur: 5.1, color: '#B6FF00' },
  { id: 3, x: '62%', y: '28%', size: 6, delay: 0.3, dur: 4.8, color: '#C77DFF' },
  { id: 4, x: '78%', y: '20%', size: 4, delay: 0.9, dur: 4.2, color: '#9D4EDD' },
  { id: 5, x: '84%', y: '56%', size: 5, delay: 0.4, dur: 5.4, color: '#B6FF00' },
  { id: 6, x: '24%', y: '54%', size: 4, delay: 1.1, dur: 4.6, color: '#C77DFF' },
];

export function ExperienceHomeView({
  onSelectMode,
  onNavigate,
}: ExperienceHomeViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const activity = EXPERIENCE_MODES.activity;
  const feel = EXPERIENCE_MODES.feel;

  return (
    <div className="min-h-[calc(100vh-220px)] flex flex-col justify-center py-4 sm:py-8 lg:py-12">
      {/* Header Prompt */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl"
      >
        <h1
          className="font-display font-bold text-white tracking-tight leading-[1.06]"
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
            textWrap: 'balance',
          }}
        >
          What&apos;s your vibe today?
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#A1A1AA] leading-relaxed">
          Choose how you want to experience music.
        </p>
      </motion.div>

      {/* Two Large Interactive Experience Mode Cards */}
      <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Card 1: Activity Mode */}
        <motion.button
          type="button"
          onClick={() => onSelectMode('activity')}
          initial={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: prefersReducedMotion ? 0 : 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={prefersReducedMotion ? undefined : { y: -4 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
          className="group relative overflow-hidden rounded-3xl border border-[#B6FF00]/25 hover:border-[#B6FF00]/75 bg-[#0F1118] text-left min-h-[300px] sm:min-h-[360px] lg:min-h-[410px] flex flex-col justify-end p-6 sm:p-8 lg:p-10 shadow-[0_24px_70px_-24px_rgba(182,255,0,0.18)] hover:shadow-[0_24px_75px_-18px_rgba(182,255,0,0.3)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
        >
          {/* Background Artwork with Deep Black & Electric Purple Scrim */}
          <div className="absolute inset-0">
            <ArtworkImage
              src={activity.coverImage}
              alt="Activity Mode dynamic studio soundwaves"
              className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(155deg, rgba(157, 78, 221, 0.24) 0%, rgba(8, 9, 13, 0.72) 48%, rgba(8, 9, 13, 0.97) 100%)',
              }}
            />
          </div>

          {/* Subtle Animated Sound Waves */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-10 sm:top-14 opacity-60 group-hover:opacity-90 transition-opacity duration-300"
          >
            <svg viewBox="0 0 600 120" fill="none" className="w-full h-24">
              <defs>
                <linearGradient id="act-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0" />
                  <stop offset="45%" stopColor="#B6FF00" stopOpacity="0.85" />
                  <stop offset="80%" stopColor="#9D4EDD" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0 60 C 90 18, 170 102, 270 60 C 370 18, 460 102, 600 56"
                stroke="url(#act-wave)"
                strokeWidth="2.4"
                strokeLinecap="round"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -5, 4, 0] }
                }
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.path
                d="M0 72 C 110 106, 210 22, 330 66 C 450 106, 520 26, 600 68"
                stroke="url(#act-wave)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeOpacity="0.55"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, 5, -4, 0] }
                }
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </svg>
          </div>

          {/* Card Content */}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {activity.title}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#A1A1AA] group-hover:text-white/90 transition-colors max-w-md leading-relaxed">
                  {activity.description}
                </p>
              </div>

              <span className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-[#B6FF00] text-[#08090D] shadow-[0_0_22px_-4px_rgba(182,255,0,0.55)] group-hover:bg-[#C6FF33] group-hover:translate-x-0.5 transition-all duration-200">
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>

            <p className="pt-3 border-t border-white/[0.09] text-xs text-[#A1A1AA] truncate">
              {activity.categoryPreview}
            </p>
          </div>
        </motion.button>

        {/* Card 2: Feel Mode */}
        <motion.button
          type="button"
          onClick={() => onSelectMode('feel')}
          initial={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: prefersReducedMotion ? 0 : 0.16,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={prefersReducedMotion ? undefined : { y: -4 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
          className="group relative overflow-hidden rounded-3xl border border-[#9D4EDD]/30 hover:border-[#9D4EDD]/80 bg-[#0F1118] text-left min-h-[300px] sm:min-h-[360px] lg:min-h-[410px] flex flex-col justify-end p-6 sm:p-8 lg:p-10 shadow-[0_24px_70px_-24px_rgba(157,78,221,0.24)] hover:shadow-[0_24px_75px_-18px_rgba(157,78,221,0.38)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9D4EDD]"
        >
          {/* Background Artwork */}
          <div className="absolute inset-0">
            <ArtworkImage
              src={feel.coverImage}
              alt="Feel Mode calm atmospheric light veils"
              className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(155deg, rgba(157, 78, 221, 0.3) 0%, rgba(8, 9, 13, 0.72) 48%, rgba(8, 9, 13, 0.97) 100%)',
              }}
            />
          </div>

          {/* Soft Floating Particles */}
          {!prefersReducedMotion && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {FEEL_PARTICLES.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    boxShadow: `0 0 12px ${p.color}`,
                    willChange: 'transform, opacity',
                  }}
                  animate={{
                    opacity: [0.25, 0.85, 0.3],
                    y: [0, -14, 0],
                    scale: [0.9, 1.15, 0.9],
                  }}
                  transition={{
                    duration: p.dur,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Card Content */}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {feel.title}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#A1A1AA] group-hover:text-white/90 transition-colors max-w-md leading-relaxed">
                  {feel.description}
                </p>
              </div>

              <span className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-gradient-to-br from-[#9D4EDD] to-[#B6FF00] text-[#08090D] shadow-[0_0_24px_-4px_rgba(157,78,221,0.5)] group-hover:translate-x-0.5 transition-all duration-200">
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>

            <p className="pt-3 border-t border-white/[0.09] text-xs text-[#A1A1AA] truncate">
              {feel.categoryPreview}
            </p>
          </div>
        </motion.button>
      </div>

      {/* Quiet Secondary Access to All Channels */}
      <div className="mt-7 flex items-center justify-between gap-4 text-xs sm:text-sm text-[#A1A1AA]">
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className="inline-flex items-center gap-2 py-2 text-[#A1A1AA] hover:text-[#B6FF00] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00] rounded-lg"
        >
          <span>Browse all mood channels</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
