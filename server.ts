import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  type AdminRequest,
  type VerifiedFirebaseUser,
  createRequireAdminMiddleware,
} from './server/auth.ts';
import {
  type FirebaseClientConfig,
  type FirestoreWriteOp,
  commitFirestoreWrites,
  deleteMediaFromFirebaseStorage,
  listFirestoreCollection,
  uploadMediaToFirebaseStorage,
} from './server/firestoreRest.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;
const VALID_MOOD_IDS = new Set([
  'workout',
  'chill',
  'sad',
  'romantic',
  'travel',
  'focus',
  'party',
  'devotional',
  'peaceful',
]);
const VALID_PROVIDERS = new Set(['youtube', 'audio', 'pending']);

function loadFirebaseConfig(): FirebaseClientConfig {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8')) as {
    projectId: string;
    firestoreDatabaseId: string;
    storageBucket: string;
  };
  return {
    projectId: raw.projectId,
    firestoreDatabaseId: raw.firestoreDatabaseId,
    storageBucket: raw.storageBucket,
  };
}

export interface ServerAppOptions {
  adminEmail?: string;
  firebaseConfig?: FirebaseClientConfig;
  verifyToken?: (token: string, projectId: string) => Promise<VerifiedFirebaseUser>;
  commitWrites?: (
    config: FirebaseClientConfig,
    idToken: string,
    ops: FirestoreWriteOp[]
  ) => Promise<void>;
  listCollection?: (
    config: FirebaseClientConfig,
    collectionName: string,
    idToken?: string
  ) => Promise<Array<{ id: string; data: Record<string, unknown> }>>;
  uploadMedia?: (
    config: FirebaseClientConfig,
    idToken: string,
    objectPath: string,
    buffer: Buffer,
    contentType: string
  ) => Promise<{ url: string; path: string }>;
  deleteMedia?: (
    config: FirebaseClientConfig,
    idToken: string,
    objectPath: string
  ) => Promise<void>;
}

interface SanitizedSongPayload {
  title: string;
  artist: string;
  album?: string;
  description?: string;
  language: string;
  moodId: string;
  provider: 'youtube' | 'audio' | 'pending';
  providerTrackId: string;
  audioUrl?: string;
  artworkUrl: string;
  durationLabel: string;
  durationSeconds: number;
  isLive: boolean;
  keywords: string[];
}

function sanitizeSongPayload(body: unknown): {
  value?: SanitizedSongPayload;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid song payload.' };
  }
  const input = body as Record<string, unknown>;

  const title = typeof input.title === 'string' ? input.title.trim().slice(0, 160) : '';
  const artist = typeof input.artist === 'string' ? input.artist.trim().slice(0, 160) : '';
  const language =
    typeof input.language === 'string' ? input.language.trim().slice(0, 40) : '';
  const moodId = typeof input.moodId === 'string' ? input.moodId.trim() : '';
  const provider = typeof input.provider === 'string' ? input.provider.trim() : '';
  const providerTrackId =
    typeof input.providerTrackId === 'string'
      ? input.providerTrackId.trim().slice(0, 512)
      : '';
  const artworkUrl =
    typeof input.artworkUrl === 'string' ? input.artworkUrl.trim().slice(0, 1024) : '';
  const durationLabel =
    typeof input.durationLabel === 'string'
      ? input.durationLabel.trim().slice(0, 20)
      : '3:30';
  const durationSecondsRaw = Number(input.durationSeconds ?? 0);
  const durationSeconds = Number.isFinite(durationSecondsRaw)
    ? Math.min(86400, Math.max(0, Math.round(durationSecondsRaw)))
    : 0;
  const isLive = Boolean(input.isLive);
  const keywords = Array.isArray(input.keywords)
    ? input.keywords
        .filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
        .map((k) => k.trim().slice(0, 40))
        .slice(0, 20)
    : [];

  if (!title) return { error: 'Song title is required.' };
  if (!artist) return { error: 'Artist name is required.' };
  if (!language) return { error: 'Music language is required.' };
  if (!VALID_MOOD_IDS.has(moodId)) return { error: 'Invalid mood category.' };
  if (!VALID_PROVIDERS.has(provider)) return { error: 'Invalid music provider.' };
  if (!providerTrackId) return { error: 'Provider track ID or source is required.' };

  const album =
    typeof input.album === 'string' && input.album.trim()
      ? input.album.trim().slice(0, 160)
      : undefined;
  const description =
    typeof input.description === 'string' && input.description.trim()
      ? input.description.trim().slice(0, 600)
      : undefined;
  const audioUrl =
    typeof input.audioUrl === 'string' && input.audioUrl.trim()
      ? input.audioUrl.trim().slice(0, 1024)
      : undefined;

  return {
    value: {
      title,
      artist,
      ...(album ? { album } : {}),
      ...(description ? { description } : {}),
      language,
      moodId,
      provider: provider as 'youtube' | 'audio' | 'pending',
      providerTrackId,
      ...(audioUrl ? { audioUrl } : {}),
      artworkUrl,
      durationLabel: durationLabel || '3:30',
      durationSeconds,
      isLive,
      keywords,
    },
  };
}

export function createApiApp(options: ServerAppOptions = {}): express.Express {
  const app = express();
  const firebaseConfig = options.firebaseConfig ?? loadFirebaseConfig();
  const adminEmail = (
    options.adminEmail ??
    process.env.ADMIN_EMAIL ??
    'dhurianiket94@gmail.com'
  )
    .trim()
    .toLowerCase();

  const commitWrites = options.commitWrites ?? commitFirestoreWrites;
  const listCollection = options.listCollection ?? listFirestoreCollection;
  const uploadMedia = options.uploadMedia ?? uploadMediaToFirebaseStorage;
  const deleteMedia = options.deleteMedia ?? deleteMediaFromFirebaseStorage;

  const requireAdmin = createRequireAdminMiddleware({
    projectId: firebaseConfig.projectId,
    adminEmail,
    verifyToken: options.verifyToken,
  });

  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Explicitly block any self-registration or privilege escalation endpoints
  app.all('/api/admin/register', (_req, res) => {
    res.status(403).json({
      error: 'Public admin registration is disabled.',
    });
  });
  app.all('/api/admin/promote', (_req, res) => {
    res.status(403).json({
      error: 'Admin role promotion is disabled.',
    });
  });

  // Protected admin session verification endpoint
  app.get('/api/admin/session', requireAdmin, (req: AdminRequest, res) => {
    res.json({
      authorized: true,
      uid: req.adminUser?.uid,
      email: req.adminUser?.email,
    });
  });

  // Ensure a language option document exists
  async function buildEnsureLanguageOp(
    languageName: string,
    idToken: string
  ): Promise<FirestoreWriteOp | null> {
    const cleanName = languageName.trim().slice(0, 40);
    const id = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    if (!cleanName || !id || !VALID_ID_REGEX.test(id)) return null;

    const existingLangs = await listCollection(
      firebaseConfig,
      'languages',
      idToken
    );
    if (existingLangs.some((l) => l.id === id)) return null;

    return {
      type: 'set',
      collection: 'languages',
      id,
      data: {
        id,
        name: cleanName,
        sortOrder: 50,
      },
      serverTimestampFields: ['updatedAt'],
    };
  }

  // Create song (server-verified admin only)
  app.post('/api/admin/songs', requireAdmin, async (req: AdminRequest, res) => {
    const parsed = sanitizeSongPayload(req.body);
    if (!parsed.value) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const idToken = req.adminToken!;
    const uid = req.adminUser!.uid;
    const songId = `song_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const existingSongs = await listCollection(firebaseConfig, 'songs', idToken);
      const normTitle = parsed.value.title.toLowerCase();
      const normArtist = parsed.value.artist.toLowerCase();
      const normProviderId = parsed.value.providerTrackId.toLowerCase();

      const duplicate = existingSongs.find((s) => {
        const d = s.data;
        const sameProviderTrack =
          parsed.value!.provider !== 'pending' &&
          String(d.provider ?? '') === parsed.value!.provider &&
          String(d.providerTrackId ?? '').trim().toLowerCase() === normProviderId;
        const sameTitleArtist =
          String(d.title ?? '').trim().toLowerCase() === normTitle &&
          String(d.artist ?? '').trim().toLowerCase() === normArtist &&
          String(d.moodId ?? '') === parsed.value!.moodId;
        return sameProviderTrack || sameTitleArtist;
      });

      if (duplicate) {
        res.status(409).json({
          error: `Duplicate detected: "${String(duplicate.data.title ?? parsed.value.title)}" already exists in this catalog.`,
        });
        return;
      }

      const ops: FirestoreWriteOp[] = [];
      const langOp = await buildEnsureLanguageOp(parsed.value.language, idToken);
      if (langOp) ops.push(langOp);

      ops.push({
        type: 'create',
        collection: 'songs',
        id: songId,
        data: {
          id: songId,
          ...parsed.value,
          createdBy: uid,
        },
        serverTimestampFields: ['createdAt', 'updatedAt'],
      });

      await commitWrites(firebaseConfig, idToken, ops);
      res.status(201).json({ id: songId });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to create song.',
      });
    }
  });

  // Update song (server-verified admin only)
  app.put('/api/admin/songs/:id', requireAdmin, async (req: AdminRequest, res) => {
    const songId = req.params.id;
    if (!VALID_ID_REGEX.test(songId)) {
      res.status(400).json({ error: 'Invalid song ID.' });
      return;
    }

    const parsed = sanitizeSongPayload(req.body);
    if (!parsed.value) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const idToken = req.adminToken!;

    try {
      const ops: FirestoreWriteOp[] = [];
      const langOp = await buildEnsureLanguageOp(parsed.value.language, idToken);
      if (langOp) ops.push(langOp);

      const updateData: Record<string, unknown> = {
        title: parsed.value.title,
        artist: parsed.value.artist,
        album: parsed.value.album ?? '',
        description: parsed.value.description ?? '',
        language: parsed.value.language,
        moodId: parsed.value.moodId,
        provider: parsed.value.provider,
        providerTrackId: parsed.value.providerTrackId,
        audioUrl: parsed.value.audioUrl ?? '',
        artworkUrl: parsed.value.artworkUrl,
        durationLabel: parsed.value.durationLabel,
        durationSeconds: parsed.value.durationSeconds,
        isLive: parsed.value.isLive,
        keywords: parsed.value.keywords,
      };

      ops.push({
        type: 'update',
        collection: 'songs',
        id: songId,
        data: updateData,
        updateMaskFields: Object.keys(updateData),
        serverTimestampFields: ['updatedAt'],
      });

      await commitWrites(firebaseConfig, idToken, ops);
      res.json({ id: songId, updated: true });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to update song.',
      });
    }
  });

  // Delete song (server-verified admin only)
  app.delete('/api/admin/songs/:id', requireAdmin, async (req: AdminRequest, res) => {
    const songId = req.params.id;
    if (!VALID_ID_REGEX.test(songId)) {
      res.status(400).json({ error: 'Invalid song ID.' });
      return;
    }

    try {
      await commitWrites(firebaseConfig, req.adminToken!, [
        {
          type: 'delete',
          collection: 'songs',
          id: songId,
        },
      ]);
      res.json({ id: songId, deleted: true });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to delete song.',
      });
    }
  });

  // Sync / migrate catalog batch (server-verified admin only)
  app.post('/api/admin/catalog/sync', requireAdmin, async (req: AdminRequest, res) => {
    const idToken = req.adminToken!;
    const uid = req.adminUser!.uid;
    const body = (req.body ?? {}) as {
      moods?: Array<Record<string, unknown>>;
      languages?: Array<Record<string, unknown>>;
      songs?: Array<Record<string, unknown>>;
      deleteMoodIds?: string[];
      deleteSongIds?: string[];
    };

    try {
      const ops: FirestoreWriteOp[] = [];

      for (const moodId of body.deleteMoodIds ?? []) {
        if (typeof moodId === 'string' && VALID_ID_REGEX.test(moodId)) {
          ops.push({ type: 'delete', collection: 'moods', id: moodId });
        }
      }

      for (const songId of body.deleteSongIds ?? []) {
        if (typeof songId === 'string' && VALID_ID_REGEX.test(songId)) {
          ops.push({ type: 'delete', collection: 'songs', id: songId });
        }
      }

      for (const m of body.moods ?? []) {
        const id = typeof m.id === 'string' ? m.id.trim() : '';
        if (!VALID_MOOD_IDS.has(id)) continue;
        ops.push({
          type: 'set',
          collection: 'moods',
          id,
          data: {
            id,
            name: String(m.name ?? id).slice(0, 60),
            emoji: String(m.emoji ?? '🎵').slice(0, 16),
            description: String(m.description ?? '').slice(0, 300),
            curatorNote: String(m.curatorNote ?? '').slice(0, 300),
            accentFrom: String(m.accentFrom ?? '#6366F1').slice(0, 20),
            accentTo: String(m.accentTo ?? '#3B82F6').slice(0, 20),
            glowColor: String(m.glowColor ?? 'rgba(99, 102, 241, 0.28)').slice(0, 60),
            coverImage: String(m.coverImage ?? '').slice(0, 1024),
            sortOrder: Math.max(0, Math.min(1000, Math.round(Number(m.sortOrder ?? 0)))),
          },
          serverTimestampFields: ['updatedAt'],
        });
      }

      for (const l of body.languages ?? []) {
        const id = typeof l.id === 'string' ? l.id.trim() : '';
        if (!VALID_ID_REGEX.test(id)) continue;
        ops.push({
          type: 'set',
          collection: 'languages',
          id,
          data: {
            id,
            name: String(l.name ?? id).slice(0, 40),
            sortOrder: Math.max(0, Math.min(1000, Math.round(Number(l.sortOrder ?? 0)))),
          },
          serverTimestampFields: ['updatedAt'],
        });
      }

      for (const s of body.songs ?? []) {
        const rawId = typeof s.id === 'string' ? s.id.trim() : '';
        if (!VALID_ID_REGEX.test(rawId)) continue;
        const parsed = sanitizeSongPayload(s);
        if (!parsed.value) continue;

        if (s.mode === 'update') {
          const updateData: Record<string, unknown> = {
            title: parsed.value.title,
            artist: parsed.value.artist,
            album: parsed.value.album ?? '',
            description: parsed.value.description ?? '',
            language: parsed.value.language,
            moodId: parsed.value.moodId,
            provider: parsed.value.provider,
            providerTrackId: parsed.value.providerTrackId,
            audioUrl: parsed.value.audioUrl ?? '',
            artworkUrl: parsed.value.artworkUrl,
            durationLabel: parsed.value.durationLabel,
            durationSeconds: parsed.value.durationSeconds,
            isLive: parsed.value.isLive,
            keywords: parsed.value.keywords,
          };
          ops.push({
            type: 'update',
            collection: 'songs',
            id: rawId,
            data: updateData,
            updateMaskFields: Object.keys(updateData),
            serverTimestampFields: ['updatedAt'],
          });
        } else {
          ops.push({
            type: 'set',
            collection: 'songs',
            id: rawId,
            data: {
              id: rawId,
              ...parsed.value,
              createdBy: uid,
            },
            serverTimestampFields: ['createdAt', 'updatedAt'],
          });
        }
      }

      // Commit in safe chunks of 400 writes
      for (let i = 0; i < ops.length; i += 400) {
        await commitWrites(firebaseConfig, idToken, ops.slice(i, i + 400));
      }

      res.json({ committed: ops.length });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Catalog sync failed.',
      });
    }
  });

  // Upload artwork or authorized audio via server-verified admin route
  app.post(
    '/api/admin/upload',
    requireAdmin,
    express.raw({
      type: ['image/*', 'audio/*', 'application/octet-stream'],
      limit: '26mb',
    }),
    async (req: AdminRequest, res) => {
      const folderHeader = String(req.headers['x-media-folder'] ?? 'artwork');
      const folder = folderHeader === 'audio' ? 'audio' : 'artwork';
      const rawFileName = String(req.headers['x-file-name'] ?? 'upload.bin');
      const safeName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
      const contentType = String(
        req.headers['content-type'] ?? 'application/octet-stream'
      );

      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: 'Upload file body is empty.' });
        return;
      }

      if (folder === 'artwork') {
        if (!contentType.startsWith('image/')) {
          res.status(400).json({ error: 'Artwork must be an image file.' });
          return;
        }
        if (req.body.length > 5 * 1024 * 1024) {
          res.status(400).json({ error: 'Artwork image must be 5 MB or smaller.' });
          return;
        }
      } else {
        const validAudio =
          contentType.startsWith('audio/') ||
          /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(safeName);
        if (!validAudio) {
          res.status(400).json({ error: 'Audio upload must be an authorized audio file.' });
          return;
        }
        if (req.body.length > 25 * 1024 * 1024) {
          res.status(400).json({ error: 'Authorized audio file must be 25 MB or smaller.' });
          return;
        }
      }

      const objectPath = `${folder}/${Date.now()}_${safeName}`;
      try {
        const result = await uploadMedia(
          firebaseConfig,
          req.adminToken!,
          objectPath,
          req.body,
          contentType
        );
        res.status(201).json(result);
      } catch (err) {
        res.status(500).json({
          error: err instanceof Error ? err.message : 'Storage upload failed.',
        });
      }
    }
  );

  // Delete uploaded media object (server-verified admin only)
  app.delete('/api/admin/storage', requireAdmin, async (req: AdminRequest, res) => {
    const objectPath =
      typeof req.body?.path === 'string' ? req.body.path.trim() : '';
    if (
      !objectPath ||
      (!objectPath.startsWith('artwork/') && !objectPath.startsWith('audio/'))
    ) {
      res.status(400).json({ error: 'Invalid storage object path.' });
      return;
    }

    try {
      await deleteMedia(firebaseConfig, req.adminToken!, objectPath);
      res.json({ deleted: true, path: objectPath });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Storage deletion failed.',
      });
    }
  });

  // Catch-all for unknown /api routes
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  return app;
}

async function startServer() {
  const app = createApiApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Vibe Zone server listening on http://0.0.0.0:${port}`);
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  void startServer();
}
