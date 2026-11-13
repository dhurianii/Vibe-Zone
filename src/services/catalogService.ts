import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { MOOD_CATEGORIES, TRACKS } from '../data/moodsAndTracks';
import {
  OperationType,
  auth,
  db,
  handleFirestoreError,
  storage,
} from '../lib/firebase';
import {
  DEFAULT_LANGUAGES,
  LanguageOption,
  MoodCategory,
  MoodId,
  ProviderType,
  Track,
} from '../types/music';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'dhurianiket94@gmail.com';

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

export async function verifyAdminAccess(uid: string, email: string | null, emailVerified: boolean): Promise<boolean> {
  if (!emailVerified) return false;
  if (email && email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', uid));
    return adminSnap.exists();
  } catch {
    return false;
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
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Admin authentication required to sync catalog.');
  }

  let seededMoods = 0;
  let seededLanguages = 0;
  let seededSongs = 0;

  // 1. Seed Moods if empty
  const moodsSnap = await getDocs(collection(db, 'moods'));
  if (moodsSnap.empty) {
    const batch = writeBatch(db);
    MOOD_CATEGORIES.forEach((mood, index) => {
      batch.set(doc(db, 'moods', mood.id), {
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
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    seededMoods = MOOD_CATEGORIES.length;
  }

  // 2. Seed Languages if empty
  const langsSnap = await getDocs(collection(db, 'languages'));
  if (langsSnap.empty) {
    const batch = writeBatch(db);
    const defaultLangObjects: LanguageOption[] = DEFAULT_LANGUAGES.map(
      (name, index) => ({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        sortOrder: index,
      })
    );
    defaultLangObjects.forEach((lang) => {
      batch.set(doc(db, 'languages', lang.id), {
        id: lang.id,
        name: lang.name,
        sortOrder: lang.sortOrder,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    seededLanguages = defaultLangObjects.length;
  }

  // 3. Seed Starter Songs if empty
  const songsSnap = await getDocs(collection(db, 'songs'));
  if (songsSnap.empty) {
    const batch = writeBatch(db);
    TRACKS.forEach((track) => {
      const safeId = track.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const docPayload: Record<string, unknown> = {
        id: safeId,
        title: track.title.slice(0, 160),
        artist: track.artist.slice(0, 160),
        language: track.language.slice(0, 40),
        moodId: track.moodId,
        provider: track.provider,
        providerTrackId: track.providerTrackId.slice(0, 512),
        artworkUrl: track.artworkUrl.slice(0, 1024),
        durationLabel: track.durationLabel.slice(0, 20),
        durationSeconds: Math.min(86400, Math.max(0, Math.round(track.durationSeconds))),
        isLive: Boolean(track.isLive),
        keywords: track.keywords.slice(0, 20),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (track.album) {
        docPayload.album = track.album.slice(0, 160);
      }
      if (track.description) {
        docPayload.description = track.description.slice(0, 600);
      }
      batch.set(doc(db, 'songs', safeId), docPayload);
    });
    await batch.commit();
    seededSongs = TRACKS.length;
  }

  return { seededSongs, seededMoods, seededLanguages };
}

/**
 * Migrates an existing pre-merge Firestore catalog so:
 * 1. `motivation` mood is merged into `WORKOUT 🔥` and deleted.
 * 2. Any existing songs under `motivation` are moved to `workout` without duplicating.
 * 3. Any missing songs from the 36+ curated Workout list are added to Firestore.
 */
export async function syncWorkoutCatalogUpgrade(): Promise<{
  migratedSongs: number;
  addedSongs: number;
  mergedMood: boolean;
}> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Admin authentication required to migrate Workout catalog.');
  }

  let migratedSongs = 0;
  let addedSongs = 0;
  let mergedMood = false;

  const batch = writeBatch(db);
  const workoutMood = MOOD_CATEGORIES.find((m) => m.id === 'workout')!;

  // 1. Update moods/workout and delete moods/motivation if present
  const moodsSnap = await getDocs(collection(db, 'moods'));
  const motivationMoodDoc = moodsSnap.docs.find((d) => d.id === 'motivation');
  const workoutMoodDoc = moodsSnap.docs.find((d) => d.id === 'workout');

  if (
    motivationMoodDoc ||
    !workoutMoodDoc ||
    workoutMoodDoc.data().name !== 'WORKOUT' ||
    workoutMoodDoc.data().emoji !== '🔥'
  ) {
    batch.set(doc(db, 'moods', 'workout'), {
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
      updatedAt: serverTimestamp(),
    });
    if (motivationMoodDoc) {
      batch.delete(doc(db, 'moods', 'motivation'));
    }
    mergedMood = true;
  }

  // 2. Migrate existing motivation songs -> workout & fix legacy Zinda duplicate
  const songsSnap = await getDocs(collection(db, 'songs'));
  const existingIds = new Set<string>();
  const existingNormalizedKeys = new Set<string>();

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
      // Remove duplicate Zinda from motivation
      batch.delete(doc(db, 'songs', d.id));
      migratedSongs += 1;
      return;
    }

    if (d.id === 'wk-hi-1' && data.providerTrackId === 'uQF7_gAW4W0') {
      batch.update(doc(db, 'songs', d.id), {
        title: 'Zinda',
        album: 'Bhaag Milkha Bhaag',
        providerTrackId: 'gdqFLjWU8x8',
        artworkUrl: 'https://i.ytimg.com/vi/gdqFLjWU8x8/hqdefault.jpg',
        moodId: 'workout',
        updatedAt: serverTimestamp(),
      });
      migratedSongs += 1;
      return;
    }

    if (data.moodId === 'motivation') {
      batch.update(doc(db, 'songs', d.id), {
        moodId: 'workout',
        updatedAt: serverTimestamp(),
      });
      migratedSongs += 1;
    }
  });

  // 3. Add missing Workout songs from static catalog (deduplicated)
  const workoutStarterTracks = TRACKS.filter((t) => t.moodId === 'workout');
  workoutStarterTracks.forEach((track) => {
    const safeId = track.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const normTitle = normalizeKey(track.title);
    if (existingIds.has(safeId) || existingNormalizedKeys.has(normTitle)) {
      return;
    }

    const docPayload: Record<string, unknown> = {
      id: safeId,
      title: track.title.slice(0, 160),
      artist: track.artist.slice(0, 160),
      language: track.language.slice(0, 40),
      moodId: 'workout',
      provider: track.provider,
      providerTrackId: track.providerTrackId.slice(0, 512),
      artworkUrl: track.artworkUrl.slice(0, 1024),
      durationLabel: track.durationLabel.slice(0, 20),
      durationSeconds: Math.min(86400, Math.max(0, Math.round(track.durationSeconds))),
      isLive: Boolean(track.isLive),
      keywords: track.keywords.slice(0, 20),
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (track.album) {
      docPayload.album = track.album.slice(0, 160);
    }
    if (track.description) {
      docPayload.description = track.description.slice(0, 600);
    }
    batch.set(doc(db, 'songs', safeId), docPayload);
    addedSongs += 1;
  });

  if (mergedMood || migratedSongs > 0 || addedSongs > 0) {
    await batch.commit();
  }

  return { migratedSongs, addedSongs, mergedMood };
}

export async function ensureLanguageExists(languageName: string): Promise<void> {
  const cleanName = languageName.trim().slice(0, 40);
  if (!cleanName) return;
  const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  if (!id) return;

  const langRef = doc(db, 'languages', id);
  const existing = await getDoc(langRef);
  if (!existing.exists()) {
    await setDoc(langRef, {
      id,
      name: cleanName,
      sortOrder: 50,
      updatedAt: serverTimestamp(),
    });
  }
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
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in as an admin to add songs.');
  }

  const songId = `song_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `songs/${songId}`;

  await ensureLanguageExists(input.language);

  const payload: Record<string, unknown> = {
    id: songId,
    title: input.title.trim().slice(0, 160),
    artist: input.artist.trim().slice(0, 160),
    language: input.language.trim().slice(0, 40),
    moodId: input.moodId,
    provider: input.provider,
    providerTrackId: input.providerTrackId.trim().slice(0, 512),
    artworkUrl: input.artworkUrl.trim().slice(0, 1024),
    durationLabel: input.durationLabel.trim().slice(0, 20),
    durationSeconds: Math.min(86400, Math.max(0, Math.round(input.durationSeconds))),
    isLive: Boolean(input.isLive),
    keywords: input.keywords.slice(0, 20),
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (input.album?.trim()) {
    payload.album = input.album.trim().slice(0, 160);
  }
  if (input.description?.trim()) {
    payload.description = input.description.trim().slice(0, 600);
  }
  if (input.audioUrl?.trim()) {
    payload.audioUrl = input.audioUrl.trim().slice(0, 1024);
  }

  try {
    await setDoc(doc(db, 'songs', songId), payload);
    return songId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSongInFirestore(
  songId: string,
  input: SongInput
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in as an admin to update songs.');
  }

  const path = `songs/${songId}`;
  await ensureLanguageExists(input.language);

  const payload: Record<string, unknown> = {
    title: input.title.trim().slice(0, 160),
    artist: input.artist.trim().slice(0, 160),
    album: input.album?.trim() ? input.album.trim().slice(0, 160) : '',
    description: input.description?.trim()
      ? input.description.trim().slice(0, 600)
      : '',
    language: input.language.trim().slice(0, 40),
    moodId: input.moodId,
    provider: input.provider,
    providerTrackId: input.providerTrackId.trim().slice(0, 512),
    audioUrl: input.audioUrl?.trim() ? input.audioUrl.trim().slice(0, 1024) : '',
    artworkUrl: input.artworkUrl.trim().slice(0, 1024),
    durationLabel: input.durationLabel.trim().slice(0, 20),
    durationSeconds: Math.min(86400, Math.max(0, Math.round(input.durationSeconds))),
    isLive: Boolean(input.isLive),
    keywords: input.keywords.slice(0, 20),
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, 'songs', songId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSongFromFirestore(songId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in as an admin to delete songs.');
  }

  const path = `songs/${songId}`;
  try {
    await deleteDoc(doc(db, 'songs', songId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function uploadArtworkFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, or WebP).');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Artwork image must be 5 MB or smaller.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `artwork/${Date.now()}_${safeName}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return await getDownloadURL(storageRef);
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

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `audio/${Date.now()}_${safeName}`);
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'audio/mpeg',
  });
  return await getDownloadURL(storageRef);
}
