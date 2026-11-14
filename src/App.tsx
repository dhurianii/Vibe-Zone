import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { PlayerBar } from './components/PlayerBar';
import { PlayerStage } from './components/PlayerStage';
import { TopNav } from './components/TopNav';
import { AdminView } from './components/admin/AdminView';
import { ExploreView } from './components/views/ExploreView';
import { HomeView } from './components/views/HomeView';
import { LibraryView } from './components/views/LibraryView';
import { SearchView } from './components/views/SearchView';
import {
  PlayerProvider,
  getRandomMoodId,
  usePlayer,
} from './context/PlayerContext';
import { SectionView } from './types/music';
import { isProtectedAdminPath } from './utils/adminRouting';

function getInitialSection(): SectionView {
  if (
    typeof window !== 'undefined' &&
    isProtectedAdminPath(window.location.pathname)
  ) {
    return 'admin';
  }
  return 'home';
}

function SonaShell() {
  const [activeSection, setActiveSection] = useState<SectionView>(getInitialSection);
  const {
    moods,
    getMood,
    activeMoodId,
    currentTrack,
    favourites,
    playMood,
  } = usePlayer();

  const activeMood = getMood(activeMoodId);

  useEffect(() => {
    const onPopState = () => {
      if (isProtectedAdminPath(window.location.pathname)) {
        setActiveSection('admin');
      } else {
        setActiveSection((prev) => (prev === 'admin' ? 'home' : prev));
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (section: SectionView) => {
    setActiveSection(section);
    if (section === 'admin') {
      if (!isProtectedAdminPath(window.location.pathname)) {
        window.history.pushState({}, '', '/admin');
      }
    } else if (isProtectedAdminPath(window.location.pathname)) {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSurpriseVibe = () => {
    if (activeSection === 'admin') {
      handleNavigate('home');
    }
    const randomMood = getRandomMoodId(moods);
    playMood(randomMood, true);
  };

  return (
    <div className="relative min-h-screen bg-[#07080B] text-slate-100 flex flex-col">
      {/* Subtle Ambient Mood Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${activeMood.glowColor}, transparent 75%)`,
        }}
      />

      <TopNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onSurpriseVibe={handleSurpriseVibe}
        favouritesCount={favourites.length}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeSection === 'home' && (
              <HomeView onNavigate={handleNavigate} />
            )}
            {activeSection === 'explore' && <ExploreView />}
            {activeSection === 'search' && <SearchView />}
            {activeSection === 'recent' && (
              <LibraryView mode="recent" onNavigate={handleNavigate} />
            )}
            {activeSection === 'favourites' && (
              <LibraryView mode="favourites" onNavigate={handleNavigate} />
            )}
            {activeSection === 'admin' && (
              <AdminView onExitAdmin={() => handleNavigate('home')} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Official Playback Stage */}
      <PlayerStage />

      {/* Quiet Editorial Footer */}
      <footer
        className={`relative z-10 border-t border-white/[0.06] ${
          currentTrack ? 'pb-[124px] md:pb-[104px]' : 'pb-[72px] md:pb-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-slate-300">
              Sona
            </span>
            <span aria-hidden="true">·</span>
            <span>Don&apos;t search for music. Find your vibe.</span>
          </div>
          <div className="flex items-center gap-3">
            <p>
              Streaming via Official YouTube IFrame Player API · No account required
            </p>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleNavigate('admin')}
              className="text-slate-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>

      <PlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <SonaShell />
    </PlayerProvider>
  );
}
