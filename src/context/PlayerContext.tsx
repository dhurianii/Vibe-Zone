import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MOOD_CATEGORIES, TRACKS, getTracksByMood } from '../data/moodsAndTracks';
import { IMusicProvider } from '../services/music/IMusicProvider';
import { YouTubeMusicProvider } from '../services/music/YouTubeMusicProvider';
import {
  LanguageFilter,
  MoodId,
  PlaybackStatus,
  RecentPlayEntry,
  Track,
} from '../types/music';

const STORAGE_FAVOURITES = 'sona_favourites_v1';
const STORAGE_RECENT = 'sona_recent_v1';
const STORAGE_VOLUME = 'sona_volume_v1';

interface PlayerContextValue {
  currentTrack: Track | null;
  queue: Track[];
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  errorMessage: string | null;
  isTheaterOpen: boolean;
  setTheaterOpen: (open: boolean) => void;
  favourites: string[];
  recentEntries: RecentPlayEntry[];
  recentTracks: Track[];
  favouriteTracks: Track[];
  activeMoodId: MoodId;
  setActiveMoodId: (moodId: MoodId) => void;
  languageFilter: LanguageFilter;
  setLanguageFilter: (language: LanguageFilter) => void;
  playTrack: (track: Track, customQueue?: Track[]) => void;
  playMood: (moodId: MoodId, shuffle?: boolean) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFavourite: (trackId: string) => void;
  isFavourite: (trackId: string) => boolean;
  clearRecentHistory: () => void;
  clearError: () => void;
  providerContainerRef: React.RefObject<HTMLDivElement | null>;
  activeProviderName: string;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function loadStoredArray<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const providerContainerRef = useRef<HTMLDivElement | null>(null);
  const providerRef = useRef<IMusicProvider | null>(null);

  const [activeMoodId, setActiveMoodId] = useState<MoodId>('chill');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('All');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>(() => getTracksByMood('chill'));
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOLUME);
      return saved ? Math.max(0, Math.min(100, Number(saved))) : 80;
    } catch {
      return 80;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTheaterOpen, setTheaterOpen] = useState(false);

  const [favourites, setFavourites] = useState<string[]>(() =>
    loadStoredArray<string[]>(STORAGE_FAVOURITES, [])
  );
  const [recentEntries, setRecentEntries] = useState<RecentPlayEntry[]>(() =>
    loadStoredArray<RecentPlayEntry[]>(STORAGE_RECENT, [])
  );

  const queueRef = useRef(queue);
  const currentTrackRef = useRef(currentTrack);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Persist favourites
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVOURITES, JSON.stringify(favourites));
    } catch {
      // Ignore quota errors
    }
  }, [favourites]);

  // Persist recent history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECENT, JSON.stringify(recentEntries));
    } catch {
      // Ignore quota errors
    }
  }, [recentEntries]);

  // Persist volume
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VOLUME, String(volume));
    } catch {
      // Ignore quota errors
    }
  }, [volume]);

  const recordRecentPlay = useCallback((trackId: string) => {
    setRecentEntries((prev) => {
      const filtered = prev.filter((item) => item.trackId !== trackId);
      return [{ trackId, playedAt: Date.now() }, ...filtered].slice(0, 24);
    });
  }, []);

  const playTrack = useCallback(
    (track: Track, customQueue?: Track[]) => {
      setErrorMessage(null);
      setCurrentTrack(track);
      setActiveMoodId(track.moodId);
      setCurrentTime(0);
      setDuration(track.durationSeconds);

      if (customQueue && customQueue.length > 0) {
        setQueue(customQueue);
      } else {
        setQueue(getTracksByMood(track.moodId));
      }

      recordRecentPlay(track.id);
      void providerRef.current?.loadTrack(track, true);
    },
    [recordRecentPlay]
  );

  const nextTrack = useCallback(() => {
    const activeQueue = queueRef.current;
    const active = currentTrackRef.current;
    if (activeQueue.length === 0) return;

    if (!active) {
      playTrack(activeQueue[0], activeQueue);
      return;
    }

    const idx = activeQueue.findIndex((t) => t.id === active.id);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % activeQueue.length;
    playTrack(activeQueue[nextIdx], activeQueue);
  }, [playTrack]);

  const previousTrack = useCallback(() => {
    const activeQueue = queueRef.current;
    const active = currentTrackRef.current;
    if (activeQueue.length === 0) return;

    if (!active) {
      playTrack(activeQueue[0], activeQueue);
      return;
    }

    // If past 4 seconds in non-live track, restart current track first
    if (!active.isLive && currentTime > 4) {
      providerRef.current?.seekTo(0);
      setCurrentTime(0);
      return;
    }

    const idx = activeQueue.findIndex((t) => t.id === active.id);
    const prevIdx =
      idx === -1 ? 0 : (idx - 1 + activeQueue.length) % activeQueue.length;
    playTrack(activeQueue[prevIdx], activeQueue);
  }, [currentTime, playTrack]);

  // Mount modular music provider once
  useEffect(() => {
    const container = providerContainerRef.current;
    if (!container) return;

    const provider = new YouTubeMusicProvider();
    providerRef.current = provider;

    provider
      .mount(container, {
        onReady: () => {
          provider.setVolume(volume);
        },
        onStatusChange: (nextStatus) => {
          setStatus(nextStatus);
        },
        onProgress: (time, total) => {
          setCurrentTime(time);
          if (total > 0) {
            setDuration(total);
          }
        },
        onError: (message) => {
          setErrorMessage(message);
        },
        onTrackEnded: () => {
          nextTrack();
        },
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Unable to initialize YouTube playback engine.'
        );
      });

    return () => {
      provider.destroy();
      providerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playMood = useCallback(
    (moodId: MoodId, shuffle = false) => {
      const filtered = getTracksByMood(moodId, languageFilter);
      const moodTracks =
        filtered.length > 0 ? filtered : getTracksByMood(moodId, 'All');
      if (moodTracks.length === 0) return;

      let ordered = [...moodTracks];
      if (shuffle) {
        ordered = ordered.sort(() => Math.random() - 0.5);
      }
      setActiveMoodId(moodId);
      playTrack(ordered[0], ordered);
    },
    [languageFilter, playTrack]
  );

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) {
      const moodTracks = getTracksByMood(activeMoodId);
      if (moodTracks.length > 0) {
        playTrack(moodTracks[0], moodTracks);
      }
      return;
    }
    if (status === 'playing' || status === 'loading') {
      providerRef.current?.pause();
    } else {
      providerRef.current?.play();
    }
  }, [activeMoodId, currentTrack, playTrack, status]);

  const seekTo = useCallback((seconds: number) => {
    providerRef.current?.seekTo(seconds);
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(nextVolume)));
    setVolumeState(clamped);
    providerRef.current?.setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      providerRef.current?.unMute();
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        providerRef.current?.mute();
      } else {
        providerRef.current?.unMute();
      }
      return next;
    });
  }, []);

  const toggleFavourite = useCallback((trackId: string) => {
    setFavourites((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [trackId, ...prev]
    );
  }, []);

  const isFavourite = useCallback(
    (trackId: string) => favourites.includes(trackId),
    [favourites]
  );

  const clearRecentHistory = useCallback(() => {
    setRecentEntries([]);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const recentTracks = useMemo(() => {
    const map = new Map(TRACKS.map((t) => [t.id, t]));
    return recentEntries
      .map((entry) => map.get(entry.trackId))
      .filter((t): t is Track => Boolean(t));
  }, [recentEntries]);

  const favouriteTracks = useMemo(() => {
    const map = new Map(TRACKS.map((t) => [t.id, t]));
    return favourites
      .map((id) => map.get(id))
      .filter((t): t is Track => Boolean(t));
  }, [favourites]);

  const value: PlayerContextValue = {
    currentTrack,
    queue,
    status,
    currentTime,
    duration,
    volume,
    isMuted,
    errorMessage,
    isTheaterOpen,
    setTheaterOpen,
    favourites,
    recentEntries,
    recentTracks,
    favouriteTracks,
    activeMoodId,
    setActiveMoodId,
    languageFilter,
    setLanguageFilter,
    playTrack,
    playMood,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleFavourite,
    isFavourite,
    clearRecentHistory,
    clearError,
    providerContainerRef,
    activeProviderName:
      providerRef.current?.displayName ?? 'YouTube Official Player',
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return ctx;
}

export function getRandomMoodId(): MoodId {
  const index = Math.floor(Math.random() * MOOD_CATEGORIES.length);
  return MOOD_CATEGORIES[index].id;
}
