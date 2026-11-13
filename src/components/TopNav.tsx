import {
  Compass,
  Heart,
  History,
  Home,
  Search,
  Shuffle,
} from 'lucide-react';
import { SectionView } from '../types/music';

interface TopNavProps {
  activeSection: SectionView;
  onNavigate: (section: SectionView) => void;
  onSurpriseVibe: () => void;
  favouritesCount: number;
}

const NAV_ITEMS: { id: SectionView; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'recent', label: 'Recent', icon: History },
  { id: 'favourites', label: 'Favourites', icon: Heart },
];

export function TopNav({
  activeSection,
  onNavigate,
  onSurpriseVibe,
  favouritesCount,
}: TopNavProps) {
  return (
    <>
      {/* Desktop & Tablet Top Bar — clean 3-zone contract */}
      <header className="md:sticky md:top-0 z-30 border-b border-white/[0.07] bg-[#07080B]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark (single text element) */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1"
          >
            Vibe Zone
          </button>

          {/* Zone 2: Single-line text navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <span>
                    {item.label}
                    {item.id === 'favourites' && favouritesCount > 0
                      ? ` (${favouritesCount})`
                      : ''}
                  </span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onSurpriseVibe}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition-all duration-150 shadow-sm shadow-indigo-950/50 active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Shuffle className="w-4 h-4" />
              <span>Surprise Vibe</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0B0D14]/95 backdrop-blur-xl"
      >
        <div className="grid grid-cols-5 items-center h-[52px] px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-[19px] h-[19px]" />
                <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
