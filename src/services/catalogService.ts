import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { MOOD_CATEGORIES, TRACKS } from '../data/moodsAndTracks';
import {
  OperationType,
  auth,
  db,
  handleFirestoreError,
} from '../lib/firebase';
import {
  DEFAULT_LANGUAGES,
  LanguageOption,
  MoodCategory,
  MoodId,
  ProviderType,
  Track,
} from '../types/music';

async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required. Please sign in with the authorized Google account.');
  }
  const idToken = await user.getIdToken();
  return {
    Authorization: `Bearer ${idToken}`,
  };
}

async function adminApiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(init.headers ?? {}),
    },
  });

  const payload = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!res.ok) {
    throw new Error(
      payload.error || `Admin request failed (${res.status}).`
    );
  }
  return payload;
}

export interface SongInput {
  title: string;
  artist: string;
  album?: string;
  description?: string;
  language: string;
  moodId: MoodId;
  provider: ProviderType;
  providerTrackId: string;
  audioUrl?: string;
  artworkUrl: string;
  durationLabel: string;
  durationSeconds: number;
  isLive: boolean;
  keywords: string[];
}

export function extractYouTubeVideoId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Already an 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '').slice(0, 11);
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
    const vParam = url.searchParams.get('v');
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
      return vParam;
    }
    const parts = url.pathname.split('/').filter(Boolean);
    const embedIdx = parts.findIndex((p) => p === 'embed' || p === 'shorts');
    if (embedIdx !== -1 && parts[embedIdx + 1]) {
      const id = parts[embedIdx + 1].slice(0, 11);
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {
    // Fallback regex extraction
    const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match?.[1]) return match[1];
  }

  return trimmed;
}

export function parseDurationToSeconds(label: string): number {
  const clean = label.trim().toUpperCase();
  if (!clean || clean === 'LIVE') return 0;
  const parts = clean.split(':').map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export interface AdminVerificationResult {
  authorized: boolean;
  email?: string;
  error?: string;
}

export async function verifyAdminAccess(): Promise<AdminVerificationResult> {
  const user = auth.currentUser;
  if (!user) {
    return { authorized: false, error: 'Authentication required.' };
  }

  try {
    const headers = await getAdminAuthHeaders();
    const res = await fetch('/api/admin/session', {
      method: 'GET',
      headers,
    });
    const data = (await res.json().catch(() => ({}))) as {
      authorized?: boolean;
      email?: string;
      error?: string;
    };

    if (!res.ok || !data.authorized) {
      return {
        authorized: false,
        email: user.email ?? undefined,
        error:
          data.error ||
          'Access Denied: This Google account is not authorized for Admin Panel access.',
      };
    }

    return {
      authorized: true,
      email: data.email ?? user.email ?? undefined,
    };
  } catch (err) {
    return {
      authorized: false,
      email: user.email ?? undefined,
      error:
        err instanceof Error
          ? err.message
          : 'Unable to verify administrator session with the server.',
    };
  }
}

function normalizeMoodId(rawMoodId: unknown): MoodId {
  const id = String(rawMoodId ?? 'chill');
  if (id === 'motivation') return 'workout';
  return id as MoodId;
}

export function subscribeToSongs(
  onData: (songs: Track[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'songs';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const moodMap = new Map(MOOD_CATEGORIES.map((m) => [m.id, m]));
      const rawItems: Track[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const moodId = normalizeMoodId(data.moodId);
        const fallbackArtwork =
          moodMap.get(moodId)?.coverImage ?? MOOD_CATEGORIES[0].coverImage;
        const provider: ProviderType =
          data.provider === 'audio'
            ? 'audio'
            : data.provider === 'pending'
              ? 'pending'
              : 'youtube';

        return {
          id: String(data.id ?? docSnap.id),
          title: String(data.title ?? ''),
          artist: String(data.artist ?? ''),
          album: typeof data.album === 'string' && data.album ? data.album : undefined,
          description:
            typeof data.description === 'string' && data.description
              ? data.description
              : undefined,
          language: String(data.language ?? 'Hindi'),
          moodId,
          provider,
          providerTrackId: String(data.providerTrackId ?? ''),
          audioUrl:
            typeof data.audioUrl === 'string' && data.audioUrl
              ? data.audioUrl
              : undefined,
          artworkUrl: String(data.artworkUrl || fallbackArtwork),
          fallbackArtwork,
          durationLabel: String(data.durationLabel ?? '3:30'),
          durationSeconds: Number(data.durationSeconds ?? 210),
          isLive: Boolean(data.isLive),
          keywords: Array.isArray(data.keywords)
            ? data.keywords.map(String)
            : [],
          createdBy:
            typeof data.createdBy === 'string' ? data.createdBy : undefined,
        };
      });

      // Guard against duplicate Zinda if legacy mt-hi-2 still exists in Firestore
      const hasPrimaryZinda = rawItems.some((item) => item.id === 'wk-hi-1');
      const items = rawItems.filter(
        (item) => !(hasPrimaryZinda && item.id === 'mt-hi-2')
      );

      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeToMoods(
  onData: (moods: MoodCategory[], needsWorkoutMigration?: boolean) => void
): () => void {
  const path = 'moods';
  const q = query(collection(db, path), orderBy('sortOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(MOOD_CATEGORIES, false);
        return;
      }
      const staticMap = new Map(MOOD_CATEGORIES.map((m) => [m.id, m]));
      let hasLegacyMotivationDoc = false;
      let hasLegacyWorkoutName = false;

      const items: MoodCategory[] = [];
      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        const rawId = String(d.id ?? docSnap.id);
        if (rawId === 'motivation') {
          hasLegacyMotivationDoc = true;
          return;
        }
        const id = rawId as MoodId;
        const fallback = staticMap.get(id);
        const isWorkout = id === 'workout';
        if (isWorkout && (String(d.name ?? '') !== 'WORKOUT' || String(d.emoji ?? '') !== '🔥')) {
          hasLegacyWorkoutName = true;
        }

        items.push({
          id,
          name: isWorkout
            ? 'WORKOUT'
            : String(d.name ?? fallback?.name ?? id),
          emoji: isWorkout
            ? '🔥'
            : String(d.emoji ?? fallback?.emoji ?? '🎵'),
          description: isWorkout && fallback
            ? fallback.description
            : String(d.description ?? fallback?.description ?? ''),
          curatorNote: isWorkout && fallback
            ? fallback.curatorNote
            : String(d.curatorNote ?? fallback?.curatorNote ?? ''),
          accentFrom: isWorkout && fallback
            ? fallback.accentFrom
            : String(d.accentFrom ?? fallback?.accentFrom ?? '#6366F1'),
          accentTo: isWorkout && fallback
            ? fallback.accentTo
            : String(d.accentTo ?? fallback?.accentTo ?? '#3B82F6'),
          glowColor: isWorkout && fallback
            ? fallback.glowColor
            : String(
                d.glowColor ?? fallback?.glowColor ?? 'rgba(99, 102, 241, 0.28)'
              ),
          coverImage: fallback?.coverImage ?? String(d.coverImage ?? ''),
          sortOrder: Number(d.sortOrder ?? 0),
        });
      });

      onData(
        items.length > 0 ? items : MOOD_CATEGORIES,
        hasLegacyMotivationDoc || hasLegacyWorkoutName
      );
    },
    () => {
      // Gracefully keep starter moods if read fails
      onData(MOOD_CATEGORIES, false);
    }
  );
}

export function subscribeToLanguages(
  onData: (languages: string[]) => void
): () => void {
  const path = 'languages';
  const q = query(collection(db, path), orderBy('sortOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_LANGUAGES);
        return;
      }
      const list = snapshot.docs
        .map((d) => String(d.data().name ?? ''))
        .filter(Boolean);
      onData(list.length > 0 ? list : DEFAULT_LANGUAGES);
    },
    () => {
      onData(DEFAULT_LANGUAGES);
    }
  );
}

export async function seedStarterCatalogIfEmpty(): Promise<{
  seededSongs: number;
  seededMoods: number;
  seededLanguages: number;
}> {
  const [moodsSnap, langsSnap, songsSnap] = await Promise.all([
    getDocs(collection(db, 'moods')),
    getDocs(collection(db, 'languages')),
    getDocs(collection(db, 'songs')),
  ]);

  const moodsPayload = moodsSnap.empty
    ? MOOD_CATEGORIES.map((mood, index) => ({
        id: mood.id,
        name: mood.name,
        emoji: mood.emoji,
        description: mood.description,
        curatorNote: mood.curatorNote,
        accentFrom: mood.accentFrom,
        accentTo: mood.accentTo,
        glowColor: mood.glowColor,
        coverImage: mood.coverImage,
        sortOrder: index,
      }))
    : [];

  const defaultLangObjects: LanguageOption[] = langsSnap.empty
    ? DEFAULT_LANGUAGES.map((name, index) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        sortOrder: index,
      }))
    : [];

  const songsPayload = songsSnap.empty
    ? TRACKS.map((track) => ({
        id: track.id.replace(/[^a-zA-Z0-9_-]/g, '_'),
        title: track.title.slice(0, 160),
        artist: track.artist.slice(0, 160),
        ...(track.album ? { album: track.album.slice(0, 160) } : {}),
        ...(track.description
          ? { description: track.description.slice(0, 600) }
          : {}),
        language: track.language.slice(0, 40),
        moodId: track.moodId,
        provider: track.provider,
        providerTrackId: track.providerTrackId.slice(0, 512),
        artworkUrl: track.artworkUrl.slice(0, 1024),
        durationLabel: track.durationLabel.slice(0, 20),
        durationSeconds: Math.min(
          86400,
          Math.max(0, Math.round(track.durationSeconds))
        ),
        isLive: Boolean(track.isLive),
        keywords: track.keywords.slice(0, 20),
      }))
    : [];

  if (
    moodsPayload.length === 0 &&
    defaultLangObjects.length === 0 &&
    songsPayload.length === 0
  ) {
    return { seededSongs: 0, seededMoods: 0, seededLanguages: 0 };
  }

  await adminApiRequest<{ committed: number }>('/api/admin/catalog/sync', {
    method: 'POST',
    body: JSON.stringify({
      moods: moodsPayload,
      languages: defaultLangObjects,
      songs: songsPayload,
    }),
  });

  return {
    seededSongs: songsPayload.length,
    seededMoods: moodsPayload.length,
    seededLanguages: defaultLangObjects.length,
  };
}

/**
 * Migrates an existing pre-merge Firestore catalog via server-verified admin API.
 */
export async function syncWorkoutCatalogUpgrade(): Promise<{
  migratedSongs: number;
  addedSongs: number;
  mergedMood: boolean;
}> {
  let migratedSongs = 0;
  let addedSongs = 0;
  let mergedMood = false;

  const workoutMood = MOOD_CATEGORIES.find((m) => m.id === 'workout')!;
  const [moodsSnap, songsSnap] = await Promise.all([
    getDocs(collection(db, 'moods')),
    getDocs(collection(db, 'songs')),
  ]);

  const motivationMoodDoc = moodsSnap.docs.find((d) => d.id === 'motivation');
  const workoutMoodDoc = moodsSnap.docs.find((d) => d.id === 'workout');

  const moodsToUpsert: Array<Record<string, unknown>> = [];
  const deleteMoodIds: string[] = [];

  if (
    motivationMoodDoc ||
    !workoutMoodDoc ||
    workoutMoodDoc.data().name !== 'WORKOUT' ||
    workoutMoodDoc.data().emoji !== '🔥'
  ) {
    moodsToUpsert.push({
      id: workoutMood.id,
      name: workoutMood.name,
      emoji: workoutMood.emoji,
      description: workoutMood.description,
      curatorNote: workoutMood.curatorNote,
      accentFrom: workoutMood.accentFrom,
      accentTo: workoutMood.accentTo,
      glowColor: workoutMood.glowColor,
      coverImage: workoutMood.coverImage,
      sortOrder: 0,
    });
    if (motivationMoodDoc) {
      deleteMoodIds.push('motivation');
    }
    mergedMood = true;
  }

  const existingIds = new Set<string>();
  const existingNormalizedKeys = new Set<string>();
  const deleteSongIds: string[] = [];
  const songsToSync: Array<Record<string, unknown>> = [];

  const normalizeKey = (title: string) =>
    title
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  songsSnap.docs.forEach((d) => {
    const data = d.data();
    existingIds.add(d.id);
    if (normalizeMoodId(data.moodId) === 'workout') {
      existingNormalizedKeys.add(normalizeKey(String(data.title ?? '')));
    }

    if (d.id === 'mt-hi-2') {
      deleteSongIds.push(d.id);
      migratedSongs += 1;
      return;
    }

    if (d.id === 'wk-hi-1' && data.providerTrackId === 'uQF7_gAW4W0') {
      songsToSync.push({
        mode: 'update',
        id: d.id,
        title: 'Zinda',
        artist: String(data.artist ?? 'Siddharth Mahadevan · Shankar-Ehsaan-Loy'),
        album: 'Bhaag Milkha Bhaag',
        language: String(data.language ?? 'Hindi'),
        moodId: 'workout',
        provider: 'youtube',
        providerTrackId: 'gdqFLjWU8x8',
        artworkUrl: 'https://i.ytimg.com/vi/gdqFLjWU8x8/hqdefault.jpg',
        durationLabel: String(data.durationLabel ?? '3:30'),
        durationSeconds: Number(data.durationSeconds ?? 210),
        isLive: Boolean(data.isLive),
        keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
      });
      migratedSongs += 1;
      return;
    }

    if (data.moodId === 'motivation') {
      songsToSync.push({
        mode: 'update',
        id: d.id,
        title: String(data.title ?? ''),
        artist: String(data.artist ?? ''),
        album: typeof data.album === 'string' ? data.album : undefined,
        description:
          typeof data.description === 'string' ? data.description : undefined,
        language: String(data.language ?? 'Hindi'),
        moodId: 'workout',
        provider: data.provider === 'audio' ? 'audio' : data.provider === 'pending' ? 'pending' : 'youtube',
        providerTrackId: String(data.providerTrackId ?? ''),
        audioUrl: typeof data.audioUrl === 'string' ? data.audioUrl : undefined,
        artworkUrl: String(data.artworkUrl ?? ''),
        durationLabel: String(data.durationLabel ?? '3:30'),
        durationSeconds: Number(data.durationSeconds ?? 210),
        isLive: Boolean(data.isLive),
        keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
      });
      migratedSongs += 1;
    }
  });

  const workoutStarterTracks = TRACKS.filter((t) => t.moodId === 'workout');
  workoutStarterTracks.forEach((track) => {
    const safeId = track.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const normTitle = normalizeKey(track.title);
    if (existingIds.has(safeId) || existingNormalizedKeys.has(normTitle)) {
      return;
    }

    songsToSync.push({
      id: safeId,
      title: track.title.slice(0, 160),
      artist: track.artist.slice(0, 160),
      ...(track.album ? { album: track.album.slice(0, 160) } : {}),
      ...(track.description
        ? { description: track.description.slice(0, 600) }
        : {}),
      language: track.language.slice(0, 40),
      moodId: 'workout',
      provider: track.provider,
      providerTrackId: track.providerTrackId.slice(0, 512),
      artworkUrl: track.artworkUrl.slice(0, 1024),
      durationLabel: track.durationLabel.slice(0, 20),
      durationSeconds: Math.min(
        86400,
        Math.max(0, Math.round(track.durationSeconds))
      ),
      isLive: Boolean(track.isLive),
      keywords: track.keywords.slice(0, 20),
    });
    addedSongs += 1;
  });

  if (
    moodsToUpsert.length > 0 ||
    deleteMoodIds.length > 0 ||
    deleteSongIds.length > 0 ||
    songsToSync.length > 0
  ) {
    await adminApiRequest<{ committed: number }>('/api/admin/catalog/sync', {
      method: 'POST',
      body: JSON.stringify({
        moods: moodsToUpsert,
        deleteMoodIds,
        deleteSongIds,
        songs: songsToSync,
      }),
    });
  }

  return { migratedSongs, addedSongs, mergedMood };
}

export function findDuplicateSong(
  input: SongInput,
  existingSongs: Track[],
  excludeSongId?: string
): Track | null {
  const normTitle = input.title.trim().toLowerCase();
  const normArtist = input.artist.trim().toLowerCase();
  const normProviderId = input.providerTrackId.trim().toLowerCase();

  return (
    existingSongs.find((song) => {
      if (excludeSongId && song.id === excludeSongId) return false;
      const sameProviderTrack =
        input.provider !== 'pending' &&
        song.provider === input.provider &&
        song.providerTrackId.trim().toLowerCase() === normProviderId;
      const sameTitleAndArtist =
        song.title.trim().toLowerCase() === normTitle &&
        song.artist.trim().toLowerCase() === normArtist &&
        song.moodId === input.moodId;
      return sameProviderTrack || sameTitleAndArtist;
    }) ?? null
  );
}

export async function createSongInFirestore(input: SongInput): Promise<string> {
  const res = await adminApiRequest<{ id: string }>('/api/admin/songs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.id;
}

export async function updateSongInFirestore(
  songId: string,
  input: SongInput
): Promise<void> {
  await adminApiRequest<{ id: string; updated: boolean }>(
    `/api/admin/songs/${encodeURIComponent(songId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    }
  );
}

export async function deleteSongFromFirestore(songId: string): Promise<void> {
  await adminApiRequest<{ id: string; deleted: boolean }>(
    `/api/admin/songs/${encodeURIComponent(songId)}`,
    {
      method: 'DELETE',
    }
  );
}

async function uploadMediaViaAdminApi(
  file: File,
  folder: 'artwork' | 'audio'
): Promise<string> {
  const authHeaders = await getAdminAuthHeaders();
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type':
        file.type || (folder === 'audio' ? 'audio/mpeg' : 'image/jpeg'),
      'x-media-folder': folder,
      'x-file-name': file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
    },
    body: file,
  });

  const payload = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !payload.url) {
    throw new Error(payload.error || 'Failed to upload media file.');
  }
  return payload.url;
}

export async function uploadArtworkFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, or WebP).');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Artwork image must be 5 MB or smaller.');
  }
  return uploadMediaViaAdminApi(file, 'artwork');
}

export async function uploadAuthorizedAudioFile(file: File): Promise<string> {
  const validAudio =
    file.type.startsWith('audio/') ||
    /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name);
  if (!validAudio) {
    throw new Error('Please upload a valid authorized audio file (MP3, WAV, OGG, M4A).');
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Authorized audio file must be 25 MB or smaller.');
  }
  return uploadMediaViaAdminApi(file, 'audio');
}
