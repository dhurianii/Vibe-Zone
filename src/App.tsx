import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { PlayerBar } from './components/PlayerBar';
import { PlayerStage } from './components/PlayerStage';
import { SplashScreen } from './components/SplashScreen';
import { TopNav } from './components/TopNav';
import { AdminView } from './components/admin/AdminView';
import { CategoryMusicView } from './components/views/CategoryMusicView';
import { ExperienceHomeView } from './components/views/ExperienceHomeView';
import { ExploreView } from './components/views/ExploreView';
import { LibraryView } from './components/views/LibraryView';
import { SearchView } from './components/views/SearchView';
import { SwipeDeckView } from './components/views/SwipeDeckView';
import {
  PlayerProvider,
  getRandomMoodId,
  usePlayer,
} from './context/PlayerContext';
import { ExperienceCategoryConfig, ExperienceMode } from './data/experiences';
import { SectionView } from './types/music';
import { isProtectedAdminPath } from './utils/adminRouting';

type HomeStage = 'experience' | 'deck' | 'category';

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
  const [homeStage, setHomeStage] = useState<HomeStage>('experience');
  const [selectedMode, setSelectedMode] = useState<ExperienceMode>('activity');
  const [deckIndexByMode, setDeckIndexByMode] = useState<Record<ExperienceMode, number>>({
    activity: 0,
    feel: 0,
  });
  const [selectedCategory, setSelectedCategory] =
    useState<ExperienceCategoryConfig | null>(null);

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
    if (section === 'home') {
      setHomeStage('experience');
    }
    if (section === 'admin') {
      if (!isProtectedAdminPath(window.location.pathname)) {
        window.history.pushState({}, '', '/admin');
      }
    } else if (isProtectedAdminPath(window.location.pathname)) {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMode = (mode: ExperienceMode) => {
    setSelectedMode(mode);
    setHomeStage('deck');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: ExperienceCategoryConfig) => {
    setSelectedCategory(category);
    setHomeStage('category');
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
    <div className="relative min-h-screen bg-[#08090D] text-white flex flex-col">
      {/* Subtle Neon Noir Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] transition-opacity duration-500"
        style={{
          background:
            activeSection === 'home' && homeStage !== 'category'
              ? 'radial-gradient(ellipse 68% 48% at 50% -10%, rgba(157, 78, 221, 0.22), transparent 75%)'
              : `radial-gradient(ellipse 68% 48% at 50% -10%, ${activeMood.glowColor}, transparent 75%)`,
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
            key={activeSection === 'home' ? `home-${homeStage}-${selectedMode}` : activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeSection === 'home' && homeStage === 'experience' && (
              <ExperienceHomeView
                onSelectMode={handleSelectMode}
                onNavigate={handleNavigate}
              />
            )}
            {activeSection === 'home' && homeStage === 'deck' && (
              <SwipeDeckView
                mode={selectedMode}
                activeIndex={deckIndexByMode[selectedMode]}
                onIndexChange={(idx) =>
                  setDeckIndexByMode((prev) => ({ ...prev, [selectedMode]: idx }))
                }
                onBackToModes={() => setHomeStage('experience')}
                onSelectCategory={handleSelectCategory}
              />
            )}
            {activeSection === 'home' &&
              homeStage === 'category' &&
              selectedCategory && (
                <CategoryMusicView
                  category={selectedCategory}
                  onBackToDeck={() => setHomeStage('deck')}
                />
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
        className={`relative z-10 border-t border-white/[0.07] ${
          currentTrack ? 'pb-[124px] md:pb-[104px]' : 'pb-[72px] md:pb-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-white">
              Vibe Zone
            </span>
            <span aria-hidden="true">·</span>
            <span>Find Your Vibe. Feel Your Moment.</span>
          </div>
          {!(activeSection === 'home' && homeStage === 'experience') && (
            <div className="flex items-center gap-3">
              <p>
                Streaming via Official YouTube IFrame Player API · No account required
              </p>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => handleNavigate('admin')}
                className="text-[#A1A1AA] hover:text-[#B6FF00] transition-colors underline underline-offset-2"
              >
                Admin
              </button>
            </div>
          )}
        </div>
      </footer>

      <PlayerBar />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !isProtectedAdminPath(window.location.pathname);
  });

  return (
    <PlayerProvider>
      <SonaShell />
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    </PlayerProvider>
  );
}
