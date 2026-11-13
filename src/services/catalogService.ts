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
      const items: Track[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const moodId = (data.moodId as MoodId) || 'chill';
        const fallbackArtwork =
          moodMap.get(moodId)?.coverImage ?? MOOD_CATEGORIES[0].coverImage;

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
          provider: data.provider === 'audio' ? 'audio' : 'youtube',
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
  onData: (moods: MoodCategory[]) => void
): () => void {
  const path = 'moods';
  const q = query(collection(db, path), orderBy('sortOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(MOOD_CATEGORIES);
        return;
      }
      const staticMap = new Map(MOOD_CATEGORIES.map((m) => [m.id, m]));
      const items: MoodCategory[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const id = String(d.id ?? docSnap.id) as MoodId;
        const fallback = staticMap.get(id);
        return {
          id,
          name: String(d.name ?? fallback?.name ?? id),
          emoji: String(d.emoji ?? fallback?.emoji ?? '🎵'),
          description: String(d.description ?? fallback?.description ?? ''),
          curatorNote: String(d.curatorNote ?? fallback?.curatorNote ?? ''),
          accentFrom: String(d.accentFrom ?? fallback?.accentFrom ?? '#6366F1'),
          accentTo: String(d.accentTo ?? fallback?.accentTo ?? '#3B82F6'),
          glowColor: String(
            d.glowColor ?? fallback?.glowColor ?? 'rgba(99, 102, 241, 0.28)'
          ),
          coverImage: fallback?.coverImage ?? String(d.coverImage ?? ''),
          sortOrder: Number(d.sortOrder ?? 0),
        };
      });
      onData(items);
    },
    () => {
      // Gracefully keep starter moods if read fails
      onData(MOOD_CATEGORIES);
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
      batch.set(doc(db, 'songs', safeId), {
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
      });
    });
    await batch.commit();
    seededSongs = TRACKS.length;
  }

  return { seededSongs, seededMoods, seededLanguages };
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
