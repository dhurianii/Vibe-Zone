import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MOOD_CATEGORIES as STATIC_MOODS } from '../data/moodsAndTracks';
import {
  subscribeToLanguages,
  subscribeToMoods,
  subscribeToSongs,
} from '../services/catalogService';
import { HtmlAudioMusicProvider } from '../services/music/HtmlAudioMusicProvider';
import { IMusicProvider } from '../services/music/IMusicProvider';
import { YouTubeMusicProvider } from '../services/music/YouTubeMusicProvider';
import {
  DEFAULT_LANGUAGES,
  LanguageFilter,
  MoodCategory,
  MoodId,
  PlaybackStatus,
  ProviderType,
  RecentPlayEntry,
  Track,
} from '../types/music';

const STORAGE_FAVOURITES = 'sona_favourites_v2';
const STORAGE_RECENT = 'sona_recent_v2';
const LEGACY_STORAGE_FAVOURITES = 'sona_favourites_v1';
const LEGACY_STORAGE_RECENT = 'sona_recent_v1';
const STORAGE_VOLUME = 'sona_volume_v1';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerContextValue {
  tracks: Track[];
  moods: MoodCategory[];
  languages: string[];
  hasCloudCatalog: boolean;
  needsWorkoutMigration: boolean;
  getMood: (moodId: MoodId) => MoodCategory;
  getMoodTracks: (moodId: MoodId, language?: LanguageFilter) => Track[];
  currentTrack: Track | null;
  queue: Track[];
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  errorMessage: string | null;
  isTheaterOpen: boolean;
  setTheaterOpen: (open: boolean) => void;
  favourites: string[];
  recentEntries: RecentPlayEntry[];
  recentTracks: Track[];
  favouriteTracks: Track[];
  activeMoodId: MoodId;
  setActiveMoodId: (moodId: MoodId) => void;
  activeCategoryLabel: string | null;
  setActiveCategoryLabel: (label: string | null) => void;
  languageFilter: LanguageFilter;
  setLanguageFilter: (language: LanguageFilter) => void;
  playTrack: (
    track: Track,
    customQueue?: Track[],
    categoryLabel?: string | null
  ) => void;
  playMood: (moodId: MoodId, shuffle?: boolean) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: Track) => void;
  playNextInQueue: (track: Track) => void;
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
  const ytProviderRef = useRef<IMusicProvider | null>(null);
  const audioProviderRef = useRef<IMusicProvider | null>(null);
  const activeProviderRef = useRef<ProviderType>('youtube');

  const [cloudSongs, setCloudSongs] = useState<Track[]>([]);
  const [hasLoadedCloudSongs, setHasLoadedCloudSongs] = useState(false);
  const [hasCloudCatalog, setHasCloudCatalog] = useState(false);
  const [needsWorkoutMigration, setNeedsWorkoutMigration] = useState(false);
  const [moods, setMoods] = useState<MoodCategory[]>(STATIC_MOODS);
  const [languages, setLanguages] = useState<string[]>(DEFAULT_LANGUAGES);

  const tracks = cloudSongs;

  // Ensure any custom language present on tracks also appears in language filters
  const availableLanguages = useMemo(() => {
    const set = new Set<string>(languages);
    tracks.forEach((t) => {
      if (t.language) set.add(t.language);
    });
    return Array.from(set);
  }, [languages, tracks]);

  const getMood = useCallback(
    (moodId: MoodId): MoodCategory => {
      const normalized = (moodId as string) === 'motivation' ? 'workout' : moodId;
      return moods.find((m) => m.id === normalized) ?? moods[0] ?? STATIC_MOODS[0];
    },
    [moods]
  );

  const getMoodTracks = useCallback(
    (moodId: MoodId, language: LanguageFilter = 'All'): Track[] => {
      return tracks.filter(
        (t) =>
          t.moodId === moodId &&
          (language === 'All' || t.language === language)
      );
    },
    [tracks]
  );

  const [activeMoodId, setActiveMoodId] = useState<MoodId>('chill');
  const [activeCategoryLabel, setActiveCategoryLabel] = useState<string | null>(
    null
  );
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('All');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
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
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
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
  const tracksRef = useRef(tracks);
  const shuffleRef = useRef(shuffleEnabled);
  const repeatModeRef = useRef(repeatMode);
  const activeCategoryLabelRef = useRef(activeCategoryLabel);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    shuffleRef.current = shuffleEnabled;
  }, [shuffleEnabled]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    activeCategoryLabelRef.current = activeCategoryLabel;
  }, [activeCategoryLabel]);

  // Purge legacy v1 localStorage song references so cleared songs never reappear
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_FAVOURITES);
      localStorage.removeItem(LEGACY_STORAGE_RECENT);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Subscribe to Firestore live catalog
  useEffect(() => {
    const unsubSongs = subscribeToSongs((items) => {
      setCloudSongs(items);
      setHasLoadedCloudSongs(true);
      setHasCloudCatalog(items.length > 0);
    });
    const unsubMoods = subscribeToMoods((items, needsMigration) => {
      setMoods(items);
      setNeedsWorkoutMigration(Boolean(needsMigration));
    });
    const unsubLanguages = subscribeToLanguages((items) => {
      setLanguages(items);
    });

    return () => {
      unsubSongs();
      unsubMoods();
      unsubLanguages();
    };
  }, []);

  // Keep currentTrack and queue synced if edited or deleted in Admin
  useEffect(() => {
    if (!hasLoadedCloudSongs) return;

    const trackMap = new Map(tracks.map((t) => [t.id, t]));

    setQueue((prev) => {
      const next = prev
        .map((item) => trackMap.get(item.id))
        .filter((t): t is Track => Boolean(t));
      return next.length === prev.length &&
        next.every((item, idx) => item === prev[idx])
        ? prev
        : next;
    });

    if (!currentTrack) return;
    const updated = trackMap.get(currentTrack.id);
    if (!updated) {
      ytProviderRef.current?.pause();
      audioProviderRef.current?.pause();
      setCurrentTrack(null);
      setStatus('idle');
      setCurrentTime(0);
      setDuration(0);
      setErrorMessage(null);
    } else if (updated !== currentTrack) {
      setCurrentTrack(updated);
    }
  }, [currentTrack, hasLoadedCloudSongs, tracks]);

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

  const getActiveProvider = useCallback((): IMusicProvider | null => {
    return activeProviderRef.current === 'audio'
      ? audioProviderRef.current
      : ytProviderRef.current;
  }, []);

  const playTrack = useCallback(
    (
      track: Track,
      customQueue?: Track[],
      categoryLabel?: string | null
    ) => {
      if (track.provider === 'pending') {
        setErrorMessage(
          `"${track.title}" is saved as Source Pending. Add a verified YouTube ID or authorized audio link in the Admin Panel to stream it.`
        );
        return;
      }

      setErrorMessage(null);
      setCurrentTrack(track);
      setActiveMoodId(track.moodId);
      if (categoryLabel !== undefined) {
        setActiveCategoryLabel(categoryLabel);
      } else if (!customQueue) {
        setActiveCategoryLabel(null);
      }
      setCurrentTime(0);
      setDuration(track.durationSeconds);

      if (customQueue && customQueue.length > 0) {
        setQueue(customQueue);
      } else {
        const moodQueue = tracksRef.current.filter(
          (t) => t.moodId === track.moodId && t.provider !== 'pending'
        );
        setQueue(moodQueue.length > 0 ? moodQueue : [track]);
      }

      recordRecentPlay(track.id);

      const nextProviderType: ProviderType =
        track.provider === 'audio' ? 'audio' : 'youtube';

      if (nextProviderType !== activeProviderRef.current) {
        // Pause previous provider cleanly when switching between YouTube and Audio
        getActiveProvider()?.pause();
        activeProviderRef.current = nextProviderType;
      }

      const targetProvider =
        nextProviderType === 'audio'
          ? audioProviderRef.current
          : ytProviderRef.current;
      void targetProvider?.loadTrack(track, true);
    },
    [getActiveProvider, recordRecentPlay]
  );

  const pickNextTrackFromQueue = useCallback(
    (fromNaturalEnd: boolean) => {
      const activeQueue = queueRef.current.filter(
        (t) => t.provider !== 'pending'
      );
      const active = currentTrackRef.current;
      if (activeQueue.length === 0) return;

      if (!active) {
        playTrack(activeQueue[0], activeQueue, activeCategoryLabelRef.current);
        return;
      }

      if (fromNaturalEnd && repeatModeRef.current === 'one') {
        getActiveProvider()?.seekTo(0);
        getActiveProvider()?.play();
        setCurrentTime(0);
        return;
      }

      if (shuffleRef.current && activeQueue.length > 1) {
        const candidates = activeQueue.filter((t) => t.id !== active.id);
        const randomPick =
          candidates[Math.floor(Math.random() * candidates.length)] ??
          activeQueue[0];
        playTrack(randomPick, activeQueue, activeCategoryLabelRef.current);
        return;
      }

      const idx = activeQueue.findIndex((t) => t.id === active.id);
      if (
        fromNaturalEnd &&
        repeatModeRef.current === 'off' &&
        idx === activeQueue.length - 1
      ) {
        setStatus('ended');
        return;
      }

      const nextIdx = idx === -1 ? 0 : (idx + 1) % activeQueue.length;
      playTrack(
        activeQueue[nextIdx],
        activeQueue,
        activeCategoryLabelRef.current
      );
    },
    [getActiveProvider, playTrack]
  );

  const nextTrack = useCallback(() => {
    pickNextTrackFromQueue(false);
  }, [pickNextTrackFromQueue]);

  const previousTrack = useCallback(() => {
    const activeQueue = queueRef.current.filter((t) => t.provider !== 'pending');
    const active = currentTrackRef.current;
    if (activeQueue.length === 0) return;

    if (!active) {
      playTrack(activeQueue[0], activeQueue, activeCategoryLabelRef.current);
      return;
    }

    if (!active.isLive && currentTime > 4) {
      getActiveProvider()?.seekTo(0);
      setCurrentTime(0);
      return;
    }

    const idx = activeQueue.findIndex((t) => t.id === active.id);
    const prevIdx =
      idx === -1 ? 0 : (idx - 1 + activeQueue.length) % activeQueue.length;
    playTrack(
      activeQueue[prevIdx],
      activeQueue,
      activeCategoryLabelRef.current
    );
  }, [currentTime, getActiveProvider, playTrack]);

  // Mount both modular music providers once
  useEffect(() => {
    const container = providerContainerRef.current;
    if (!container) return;

    const ytProvider = new YouTubeMusicProvider();
    const audioProvider = new HtmlAudioMusicProvider();
    ytProviderRef.current = ytProvider;
    audioProviderRef.current = audioProvider;

    const buildCallbacks = (providerType: ProviderType) => ({
      onReady: () => {
        const p =
          providerType === 'audio' ? audioProvider : ytProvider;
        p.setVolume(volume);
      },
      onStatusChange: (nextStatus: PlaybackStatus) => {
        if (activeProviderRef.current === providerType) {
          setStatus(nextStatus);
        }
      },
      onProgress: (time: number, total: number) => {
        if (activeProviderRef.current === providerType) {
          setCurrentTime(time);
          if (total > 0) {
            setDuration(total);
          }
        }
      },
      onError: (message: string) => {
        if (activeProviderRef.current === providerType) {
          setErrorMessage(message);
        }
      },
      onTrackEnded: () => {
        if (activeProviderRef.current === providerType) {
          pickNextTrackFromQueue(true);
        }
      },
    });

    ytProvider
      .mount(container, buildCallbacks('youtube'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Unable to initialize YouTube playback engine.'
        );
      });

    void audioProvider.mount(container, buildCallbacks('audio'));

    return () => {
      ytProvider.destroy();
      audioProvider.destroy();
      ytProviderRef.current = null;
      audioProviderRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playMood = useCallback(
    (moodId: MoodId, shuffle = false) => {
      const filtered = getMoodTracks(moodId, languageFilter);
      const moodTracks =
        filtered.length > 0 ? filtered : getMoodTracks(moodId, 'All');
      const playable = moodTracks.filter((t) => t.provider !== 'pending');
      const targetList = playable.length > 0 ? playable : moodTracks;
      if (targetList.length === 0) return;

      let ordered = [...targetList];
      if (shuffle) {
        ordered = ordered.sort(() => Math.random() - 0.5);
      }
      setActiveMoodId(moodId);
      setActiveCategoryLabel(null);
      playTrack(ordered[0], ordered, null);
    },
    [getMoodTracks, languageFilter, playTrack]
  );

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) {
      const moodTracks = getMoodTracks(activeMoodId, languageFilter);
      const fallbackTracks =
        moodTracks.length > 0 ? moodTracks : getMoodTracks(activeMoodId, 'All');
      if (fallbackTracks.length > 0) {
        playTrack(fallbackTracks[0], fallbackTracks);
      }
      return;
    }
    if (status === 'playing' || status === 'loading') {
      getActiveProvider()?.pause();
    } else {
      getActiveProvider()?.play();
    }
  }, [
    activeMoodId,
    currentTrack,
    getActiveProvider,
    getMoodTracks,
    languageFilter,
    playTrack,
    status,
  ]);

  const seekTo = useCallback(
    (seconds: number) => {
      getActiveProvider()?.seekTo(seconds);
      setCurrentTime(seconds);
    },
    [getActiveProvider]
  );

  const setVolume = useCallback(
    (nextVolume: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(nextVolume)));
      setVolumeState(clamped);
      ytProviderRef.current?.setVolume(clamped);
      audioProviderRef.current?.setVolume(clamped);
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
        ytProviderRef.current?.unMute();
        audioProviderRef.current?.unMute();
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        ytProviderRef.current?.mute();
        audioProviderRef.current?.mute();
      } else {
        ytProviderRef.current?.unMute();
        audioProviderRef.current?.unMute();
      }
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleEnabled((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) =>
      prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'
    );
  }, []);

  const addToQueue = useCallback(
    (track: Track) => {
      if (track.provider === 'pending') {
        setErrorMessage(
          `"${track.title}" is saved as Source Pending and cannot be queued until verified.`
        );
        return;
      }
      if (!currentTrackRef.current) {
        playTrack(track, [track]);
        return;
      }
      setQueue((prev) => {
        const filtered = prev.filter((item) => item.id !== track.id);
        return [...filtered, track];
      });
    },
    [playTrack]
  );

  const playNextInQueue = useCallback(
    (track: Track) => {
      if (track.provider === 'pending') {
        setErrorMessage(
          `"${track.title}" is saved as Source Pending and cannot be queued until verified.`
        );
        return;
      }
      const current = currentTrackRef.current;
      if (!current) {
        playTrack(track, [track]);
        return;
      }
      if (current.id === track.id) return;
      setQueue((prev) => {
        const filtered = prev.filter((item) => item.id !== track.id);
        const currentIdx = filtered.findIndex((item) => item.id === current.id);
        if (currentIdx === -1) {
          return [current, track, ...filtered];
        }
        return [
          ...filtered.slice(0, currentIdx + 1),
          track,
          ...filtered.slice(currentIdx + 1),
        ];
      });
    },
    [playTrack]
  );

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
    const map = new Map(tracks.map((t) => [t.id, t]));
    return recentEntries
      .map((entry) => map.get(entry.trackId))
      .filter((t): t is Track => Boolean(t));
  }, [recentEntries, tracks]);

  const favouriteTracks = useMemo(() => {
    const map = new Map(tracks.map((t) => [t.id, t]));
    return favourites
      .map((id) => map.get(id))
      .filter((t): t is Track => Boolean(t));
  }, [favourites, tracks]);

  const activeProviderName =
    currentTrack?.provider === 'audio'
      ? audioProviderRef.current?.displayName ?? 'Authorized Audio Stream'
      : ytProviderRef.current?.displayName ?? 'YouTube Official Player';

  const value: PlayerContextValue = {
    tracks,
    moods,
    languages: availableLanguages,
    hasCloudCatalog,
    needsWorkoutMigration,
    getMood,
    getMoodTracks,
    currentTrack,
    queue,
    status,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffleEnabled,
    repeatMode,
    errorMessage,
    isTheaterOpen,
    setTheaterOpen,
    favourites,
    recentEntries,
    recentTracks,
    favouriteTracks,
    activeMoodId,
    setActiveMoodId,
    activeCategoryLabel,
    setActiveCategoryLabel,
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
    toggleShuffle,
    cycleRepeatMode,
    addToQueue,
    playNextInQueue,
    toggleFavourite,
    isFavourite,
    clearRecentHistory,
    clearError,
    providerContainerRef,
    activeProviderName,
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

export function getRandomMoodId(moods: MoodCategory[] = STATIC_MOODS): MoodId {
  const index = Math.floor(Math.random() * moods.length);
  return moods[index]?.id ?? 'chill';
}
