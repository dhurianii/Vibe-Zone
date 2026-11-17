import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

interface FloatingParticle {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  color: string;
}

const AMBIENT_PARTICLES: FloatingParticle[] = [
  { id: 1, x: '14%', y: '24%', size: 4, delay: 0.05, duration: 3.2, driftX: 12, driftY: -18, color: '#B6FF00' },
  { id: 2, x: '22%', y: '68%', size: 3, delay: 0.2, duration: 3.6, driftX: -10, driftY: -14, color: '#9D4EDD' },
  { id: 3, x: '31%', y: '34%', size: 5, delay: 0.1, duration: 3.4, driftX: 14, driftY: 12, color: '#C77DFF' },
  { id: 4, x: '42%', y: '18%', size: 3, delay: 0.3, duration: 3.1, driftX: -8, driftY: 16, color: '#9D4EDD' },
  { id: 5, x: '60%', y: '20%', size: 4, delay: 0.15, duration: 3.5, driftX: 10, driftY: 14, color: '#B6FF00' },
  { id: 6, x: '72%', y: '30%', size: 5, delay: 0.25, duration: 3.2, driftX: -14, driftY: -12, color: '#9D4EDD' },
  { id: 7, x: '84%', y: '44%', size: 3, delay: 0.12, duration: 3.6, driftX: -12, driftY: -16, color: '#B6FF00' },
  { id: 8, x: '78%', y: '72%', size: 4, delay: 0.28, duration: 3.3, driftX: 12, driftY: -14, color: '#C77DFF' },
  { id: 9, x: '64%', y: '78%', size: 3, delay: 0.18, duration: 3.4, driftX: -10, driftY: 10, color: '#9D4EDD' },
  { id: 10, x: '36%', y: '76%', size: 4, delay: 0.22, duration: 3.1, driftX: 14, driftY: -12, color: '#B6FF00' },
  { id: 11, x: '18%', y: '46%', size: 3, delay: 0.08, duration: 3.5, driftX: 10, driftY: 12, color: '#9D4EDD' },
  { id: 12, x: '88%', y: '24%', size: 4, delay: 0.32, duration: 3.3, driftX: -10, driftY: 16, color: '#B6FF00' },
];

const TAGLINE_WORDS = ['Find', 'Your', 'Vibe.', 'Feel', 'Your', 'Moment.'];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const [pulsePhase, setPulsePhase] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      const quickTimer = window.setTimeout(() => {
        setIsVisible(false);
      }, 950);
      return () => window.clearTimeout(quickTimer);
    }

    const pulseTimer = window.setTimeout(() => {
      setPulsePhase(true);
    }, 2200);

    const exitTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 3050);

    return () => {
      window.clearTimeout(pulseTimer);
      window.clearTimeout(exitTimer);
    };
  }, [prefersReducedMotion]);

  const handleSkip = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="vibe-zone-splash"
          role="dialog"
          aria-modal="true"
          aria-label="Vibe Zone opening experience"
          initial={{ opacity: 1, scale: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0.25 } }
              : {
                  opacity: 0,
                  scale: 1.05,
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                }
          }
          className="fixed inset-0 z-[100] overflow-hidden bg-[#08090D] flex items-center justify-center px-6 select-none"
        >
          {/* Scene 1: Deep Black Canvas with Electric Purple & Neon Green Glow */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.75, scale: 1 }
                : { opacity: [0.2, 0.85, 0.72], scale: [0.88, 1.06, 1] }
            }
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 36% 42%, rgba(157, 78, 221, 0.28), transparent 52%), radial-gradient(circle at 66% 58%, rgba(182, 255, 0, 0.14), transparent 52%)',
            }}
          />

          {/* Subtle Central Depth Vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 45%, rgba(4, 5, 8, 0.8) 100%)',
            }}
          />

          {/* Scene 1: Rhythmic Glowing Ambient Particles */}
          {!prefersReducedMotion && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {AMBIENT_PARTICLES.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                    willChange: 'transform, opacity',
                  }}
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.85, 0.35, 0.75, 0],
                    scale: [0.5, 1.15, 0.9, 1.1, 0.7],
                    x: [0, p.driftX, p.driftX * 0.4, p.driftX * 1.1],
                    y: [0, p.driftY, p.driftY * 0.5, p.driftY * 1.15],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Scene 1 & Scene 3: Flowing Harmonic Sound-Wave Curves */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden"
          >
            <svg
              viewBox="0 0 1440 280"
              fill="none"
              className="w-[150%] sm:w-[120%] max-w-none h-48 sm:h-64 opacity-70"
            >
              <defs>
                <linearGradient id="vz-wave-1" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0" />
                  <stop offset="30%" stopColor="#9D4EDD" stopOpacity="0.7" />
                  <stop offset="58%" stopColor="#B6FF00" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#B6FF00" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="vz-wave-2" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#B6FF00" stopOpacity="0" />
                  <stop offset="35%" stopColor="#B6FF00" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#9D4EDD" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0" />
                </linearGradient>
              </defs>

              <motion.path
                d="M-120 140 C 180 60, 340 220, 620 140 C 860 72, 1080 212, 1560 140"
                stroke="url(#vz-wave-1)"
                strokeWidth="2.2"
                strokeLinecap="round"
                initial={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 0.4 }
                    : { pathLength: 0, opacity: 0 }
                }
                animate={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 0.4 }
                    : {
                        pathLength: 1,
                        opacity: [0, 0.9, 0.55],
                        y: [0, -8, 4, 0],
                      }
                }
                transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
              />

              <motion.path
                d="M-120 148 C 220 225, 420 65, 720 145 C 1020 225, 1220 75, 1560 142"
                stroke="url(#vz-wave-2)"
                strokeWidth="1.6"
                strokeLinecap="round"
                initial={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 0.3 }
                    : { pathLength: 0, opacity: 0 }
                }
                animate={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 0.3 }
                    : {
                        pathLength: 1,
                        opacity: [0, 0.75, 0.45],
                        y: [0, 8, -5, 0],
                      }
                }
                transition={{ duration: 2.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </div>

          {/* Centerpiece Stage: Logo Reveal + Brand Introduction */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
            {/* Scene 2 & 3: Logo Emblem + Acoustic Rings */}
            <div className="relative flex items-center justify-center mb-7 sm:mb-8">
              {!prefersReducedMotion && (
                <>
                  <motion.span
                    aria-hidden="true"
                    className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#B6FF00]/55"
                    initial={{ opacity: 0, scale: 0.65 }}
                    animate={{
                      opacity: [0, 0.85, 0],
                      scale: [0.75, 1.75, 2.05],
                    }}
                    transition={{
                      duration: 1.45,
                      delay: 0.85,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                  <motion.span
                    aria-hidden="true"
                    className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#9D4EDD]/55"
                    initial={{ opacity: 0, scale: 0.65 }}
                    animate={{
                      opacity: [0, 0.7, 0],
                      scale: [0.75, 1.5, 1.85],
                    }}
                    transition={{
                      duration: 1.35,
                      delay: 1.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </>
              )}

              {!prefersReducedMotion && pulsePhase && (
                <motion.span
                  aria-hidden="true"
                  className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(182, 255, 0, 0.32) 0%, rgba(157, 78, 221, 0.24) 48%, transparent 72%)',
                  }}
                  initial={{ opacity: 0.85, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 2.35 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              {/* Subtle Halo Behind Emblem */}
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0.15 : 0.8,
                  delay: prefersReducedMotion ? 0 : 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full blur-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(157, 78, 221, 0.52), rgba(182, 255, 0, 0.28))',
                }}
              />

              {/* Vibe Zone Emblem */}
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.72 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.75,
                  delay: prefersReducedMotion ? 0 : 0.68,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-[1.5px] shadow-[0_14px_45px_rgba(157,78,221,0.35)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(157, 78, 221, 0.95), rgba(182, 255, 0, 0.88))',
                }}
              >
                <div className="w-full h-full rounded-[22px] bg-[#08090D]/95 backdrop-blur-md flex items-center justify-center">
                  <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    className="w-12 h-12 sm:w-14 sm:h-14"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="vz-logo-grad" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="52%" stopColor="#C77DFF" />
                        <stop offset="100%" stopColor="#B6FF00" />
                      </linearGradient>
                    </defs>
                    <motion.rect
                      x="13"
                      y="24"
                      width="4.5"
                      height="16"
                      rx="2.25"
                      fill="url(#vz-logo-grad)"
                      initial={{ scaleY: 0.4, opacity: 0.5 }}
                      animate={
                        prefersReducedMotion
                          ? { scaleY: 1, opacity: 1 }
                          : { scaleY: [0.45, 1.12, 0.9, 1], opacity: 1 }
                      }
                      transition={{ duration: 0.9, delay: 0.8 }}
                      style={{ transformOrigin: 'center' }}
                    />
                    <motion.path
                      d="M22.5 19 L32 45 L41.5 19"
                      stroke="url(#vz-logo-grad)"
                      strokeWidth="5.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.65, delay: 0.82, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.rect
                      x="46.5"
                      y="24"
                      width="4.5"
                      height="16"
                      rx="2.25"
                      fill="url(#vz-logo-grad)"
                      initial={{ scaleY: 0.4, opacity: 0.5 }}
                      animate={
                        prefersReducedMotion
                          ? { scaleY: 1, opacity: 1 }
                          : { scaleY: [0.45, 1.12, 0.9, 1], opacity: 1 }
                      }
                      transition={{ duration: 0.9, delay: 0.88 }}
                      style={{ transformOrigin: 'center' }}
                    />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Scene 3: Brand Name VIBE ZONE */}
            <motion.h1
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 16, letterSpacing: '0.24em' }
              }
              animate={{ opacity: 1, y: 0, letterSpacing: '0.16em' }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.65,
                delay: prefersReducedMotion ? 0 : 1.38,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-[0.16em] drop-shadow-[0_4px_24px_rgba(182,255,0,0.22)]"
            >
              VIBE ZONE
            </motion.h1>

            {/* Scene 3: Animated Tagline Reveal */}
            <p className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base sm:text-lg md:text-xl font-medium text-[#A1A1AA] tracking-wide">
              {TAGLINE_WORDS.map((word, idx) => (
                <motion.span
                  key={`${word}-${idx}`}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 10, filter: 'blur(4px)' }
                  }
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: prefersReducedMotion ? 0.15 : 0.42,
                    delay: prefersReducedMotion ? 0 : 1.72 + idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={
                    idx >= 3
                      ? 'bg-gradient-to-r from-[#C77DFF] to-[#B6FF00] bg-clip-text text-transparent font-semibold'
                      : 'text-white/95'
                  }
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </div>

          {/* Subtle Accessible Skip Affordance */}
          <motion.button
            type="button"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.78 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.6 }}
            className="absolute bottom-6 right-6 min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-[#B6FF00] border border-white/10 hover:border-[#B6FF00]/40 bg-[#0F1118]/80 backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]"
          >
            Skip
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
