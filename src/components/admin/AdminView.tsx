import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { auth, googleAuthProvider } from '../../lib/firebase';
import {
  clearAllSongsInFirestore,
  deleteSongFromFirestore,
  seedStarterCatalogIfEmpty,
  syncWorkoutCatalogUpgrade,
  verifyAdminAccess,
} from '../../services/catalogService';
import { Track } from '../../types/music';
import { evaluateAdminRouteGate } from '../../utils/adminRouting';
import { ArtworkImage } from '../ArtworkImage';
import { SongFormModal } from './SongFormModal';

interface AdminViewProps {
  onExitAdmin: () => void;
}

export function AdminView({ onExitAdmin }: AdminViewProps) {
  const {
    tracks,
    moods,
    languages,
    hasCloudCatalog,
    needsWorkoutMigration,
    getMood,
  } = usePlayer();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [serverAuthError, setServerAuthError] = useState<string | null>(null);
  const [isServerError, setIsServerError] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [langFilter, setLangFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const runServerVerification = async () => {
    setAuthLoading(true);
    setServerAuthError(null);
    setIsServerError(false);
    const verification = await verifyAdminAccess();
    setIsAuthorized(verification.authorized);
    if (!verification.authorized) {
      setIsServerError(Boolean(verification.isServerError));
      setServerAuthError(
        verification.error ??
          'Access Denied: Only the authorized project owner can access the Admin Panel.'
      );
    }
    setAuthLoading(false);
  };

  // Auth listener & cryptographic server-side admin verification
  useEffect(() => {
    let active = true;
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setAuthError(null);
      setServerAuthError(null);
      setIsServerError(false);

      if (!nextUser) {
        setIsAuthorized(false);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      const verification = await verifyAdminAccess();
      if (!active) return;

      setIsAuthorized(verification.authorized);
      if (!verification.authorized) {
        setIsServerError(Boolean(verification.isServerError));
        setServerAuthError(
          verification.error ??
            'Access Denied: Only the authorized project owner can access the Admin Panel.'
        );
      }
      setAuthLoading(false);
    });

    return () => {
      active = false;
      unsub();
    };
  }, []);

  // Redirect logged-out or unauthorized users away from protected /admin routes
  useEffect(() => {
    if (authLoading || typeof window === 'undefined' || isServerError) return;
    const decision = evaluateAdminRouteGate(window.location.pathname, {
      isAuthenticated: Boolean(user),
      isAuthorized,
    });
    if (decision.redirectTo && window.location.pathname !== decision.redirectTo) {
      window.history.replaceState({}, '', decision.redirectTo);
    }
  }, [authLoading, isAuthorized, isServerError, user]);

  // Sync mood/language metadata only if legacy migration is needed (never seeds starter songs)
  useEffect(() => {
    if (!isAuthorized) return;
    if (!needsWorkoutMigration) return;

    let cancelled = false;
    setIsSyncing(true);

    syncWorkoutCatalogUpgrade()
      .then((res) => {
        if (!cancelled && (res.mergedMood || res.migratedSongs > 0)) {
          setFeedbackMessage('Synced mood category metadata in Firestore.');
        }
      })
      .catch(() => {
        // Admin can also trigger manual sync if needed
      })
      .finally(() => {
        if (!cancelled) setIsSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthorized, needsWorkoutMigration]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code ?? '')
          : '';
      if (code === 'auth/unauthorized-domain') {
        const host =
          typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setAuthError(
          `Sign-in is blocked because "${host}" is not listed in Firebase Authentication -> Settings -> Authorized domains for this project.`
        );
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.'
        );
      } else {
        setAuthError(
          err instanceof Error
            ? err.message
            : 'Google sign-in was cancelled or blocked.'
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthorized(false);
    setServerAuthError(null);
    await signOut(auth);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/admin/login');
    }
  };

  const handleManualSync = async () => {
    setActionError(null);
    setIsSyncing(true);
    try {
      const [metaRes, workoutRes] = await Promise.all([
        seedStarterCatalogIfEmpty(),
        syncWorkoutCatalogUpgrade(),
      ]);
      if (
        metaRes.seededMoods > 0 ||
        metaRes.seededLanguages > 0 ||
        workoutRes.mergedMood ||
        workoutRes.migratedSongs > 0
      ) {
        setFeedbackMessage('Synced mood and language categories in Firestore.');
      } else {
        setFeedbackMessage('Mood and language categories are already up to date.');
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to sync categories.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTrack) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteSongFromFirestore(deletingTrack.id);
      setFeedbackMessage(`Deleted "${deletingTrack.title}".`);
      setDeletingTrack(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete song.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClearAll = async () => {
    if (tracks.length === 0) {
      setConfirmClearAll(false);
      return;
    }
    setIsClearingAll(true);
    setActionError(null);
    try {
      const { deletedCount } = await clearAllSongsInFirestore(
        tracks.map((t) => t.id)
      );
      setFeedbackMessage(
        `Cleared ${deletedCount} ${deletedCount === 1 ? 'song' : 'songs'} from Firestore.`
      );
      setConfirmClearAll(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to clear songs.'
      );
    } finally {
      setIsClearingAll(false);
    }
  };

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tracks.filter((t) => {
      if (moodFilter !== 'all' && t.moodId !== moodFilter) return false;
      if (langFilter !== 'all' && t.language !== langFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album ?? '').toLowerCase().includes(q) ||
        t.providerTrackId.toLowerCase().includes(q)
      );
    });
  }, [langFilter, moodFilter, searchQuery, tracks]);

  // Loading auth state
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#A1A1AA] text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#B6FF00]" />
          <span>Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated gate
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 sm:py-20">
        <div className="rounded-2xl border border-[#9D4EDD]/30 bg-[#0F1118] p-6 sm:p-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#9D4EDD]/15 border border-[#9D4EDD]/40 flex items-center justify-center text-[#C77DFF]">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Admin Sign In
            </h1>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Sign in with an authorized administrator Google account to manage Vibe Zone&apos;s songs, moods, languages, and uploaded media.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200 leading-relaxed"
            >
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full h-12 rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-[0_6px_22px_rgba(182,255,0,0.22)]"
            >
              {isSigningIn && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full h-11 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white border border-white/[0.1] bg-[#08090D] hover:border-[#9D4EDD]/50 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Vibe Zone</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but unauthorized -> Access Denied (or verification service error)
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-12 sm:py-20">
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-[#0F1118] p-6 sm:p-8 space-y-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              {isServerError ? 'Admin Verification Failed' : 'Access Denied'}
            </h1>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Signed in as <span className="font-medium text-white">{user.email}</span>.
              {isServerError
                ? ' The server could not complete administrator verification.'
                : ' Only the authorized project owner can access the Vibe Zone Admin Panel.'}
            </p>
            {serverAuthError && (
              <p className="mt-2.5 text-xs text-rose-300 leading-relaxed">
                {serverAuthError}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isServerError && (
              <button
                type="button"
                onClick={runServerVerification}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:brightness-110 flex items-center justify-center gap-2"
              >
                <span>Retry</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 h-11 rounded-xl text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="flex-1 h-11 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white border border-white/[0.1] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Vibe Zone</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#C77DFF]">
            Protected Admin Route · {user.email}
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Admin Studio
          </h1>
          <p className="mt-1.5 text-sm text-[#A1A1AA]">
            Manage songs, moods, languages, and authorized media across the live application.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {needsWorkoutMigration && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-medium text-[#C77DFF] border border-[#9D4EDD]/40 bg-[#9D4EDD]/15 hover:bg-[#9D4EDD]/25 whitespace-nowrap"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              <span>Sync Categories</span>
            </button>
          )}

          {tracks.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-medium text-rose-300 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Songs</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-medium text-slate-200 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-medium text-slate-300 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] hover:text-white whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Feedback / Error Banners */}
      {feedbackMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center justify-between gap-3 text-sm text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs text-emerald-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {actionError}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0F1118] p-5">
          <p className="text-xs font-medium text-[#A1A1AA]">Total Songs</p>
          <p className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {tracks.length}
          </p>
          <p className="mt-1 text-xs text-[#B6FF00]">
            {hasCloudCatalog ? 'Live in Firestore' : 'Clean library · Ready for new songs'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0F1118] p-5">
          <p className="text-xs font-medium text-[#A1A1AA]">Mood Categories</p>
          <p className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {moods.length}
          </p>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Active mood discovery channels
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0F1118] p-5">
          <p className="text-xs font-medium text-[#A1A1AA]">Languages</p>
          <p className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {languages.length}
          </p>
          <p className="mt-1 text-xs text-[#A1A1AA] truncate">
            {languages.join(' · ')}
          </p>
        </div>
      </div>

      {/* Search, Filter & Add Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-1 gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs by title, artist, album, or ID..."
              aria-label="Filter songs"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/[0.1] bg-[#0F1118] text-sm text-white placeholder:text-[#A1A1AA]/60 focus:outline-none focus:border-[#B6FF00]"
            />
          </div>

          <select
            aria-label="Filter by mood"
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#0F1118] text-sm text-white focus:outline-none focus:border-[#B6FF00]"
          >
            <option value="all">All Moods</option>
            {moods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.emoji} {m.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by language"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#0F1118] text-sm text-white focus:outline-none focus:border-[#B6FF00]"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTrack(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:brightness-110 whitespace-nowrap shrink-0 shadow-[0_6px_20px_rgba(182,255,0,0.22)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Song</span>
        </button>
      </div>

      {/* Song Management Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0F1118] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between text-xs text-[#A1A1AA]">
          <span className="tabular-nums">
            Showing {filteredSongs.length} of {tracks.length} songs
          </span>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-display text-base font-semibold text-white">
              {tracks.length === 0
                ? 'No songs in library yet'
                : 'No songs match your filters'}
            </p>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              {tracks.length === 0
                ? 'Click "Add New Song" to start building your verified music collection.'
                : 'Adjust your search or click "Add New Song" to publish a track.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-xs font-medium text-[#A1A1AA]">
                  <th className="py-3.5 px-5">Track</th>
                  <th className="py-3.5 px-4">Artist</th>
                  <th className="py-3.5 px-4">Mood</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {filteredSongs.map((track) => {
                  const mood = getMood(track.moodId);
                  return (
                    <tr
                      key={track.id}
                      className="hover:bg-white/[0.025] transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/[0.08] bg-[#08090D]">
                            <ArtworkImage
                              src={track.artworkUrl}
                              fallbackSrc={track.fallbackArtwork}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate max-w-[230px]">
                              {track.title}
                            </p>
                            {track.album && (
                              <p className="text-xs text-slate-400 truncate max-w-[230px]">
                                {track.album}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300 max-w-[180px] truncate">
                        {track.artist}
                      </td>

                      <td className="py-3 px-4 text-slate-200 whitespace-nowrap">
                        {mood.emoji} {mood.name}
                      </td>

                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {track.language}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {track.provider === 'youtube' ? (
                          <span>
                            YouTube ·{' '}
                            <span className="font-mono text-slate-300">
                              {track.providerTrackId}
                            </span>
                          </span>
                        ) : track.provider === 'pending' ? (
                          <span className="font-medium text-amber-300">
                            Source Pending
                          </span>
                        ) : (
                          <span>Authorized Audio</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
                        {track.durationLabel}
                      </td>

                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTrack(track);
                              setIsFormOpen(true);
                            }}
                            aria-label={`Edit ${track.title}`}
                            className="min-w-[38px] min-h-[38px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:bg-white/[0.06]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingTrack(track)}
                            aria-label={`Delete ${track.title}`}
                            className="min-w-[38px] min-h-[38px] px-2.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 border border-rose-500/20 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Song Modal */}
      <SongFormModal
        isOpen={isFormOpen}
        editingTrack={editingTrack}
        existingTracks={tracks}
        moods={moods}
        languages={languages}
        onClose={() => setIsFormOpen(false)}
        onSuccess={(msg) => setFeedbackMessage(msg)}
      />

      {/* Delete Confirmation Dialog */}
      {deletingTrack && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#9D4EDD]/30 bg-[#0F1118] p-6 space-y-5 shadow-2xl">
            <div>
              <h2
                id="delete-confirm-title"
                className="font-display text-lg font-bold text-white"
              >
                Delete Song
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-white">
                  &ldquo;{deletingTrack.title}&rdquo;
                </span>{' '}
                by {deletingTrack.artist}? This removes it from the live catalog immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingTrack(null)}
                className="px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.1]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete Song</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Songs Confirmation Dialog */}
      {confirmClearAll && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-all-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-2xl border border-rose-500/35 bg-[#0F1118] p-6 space-y-5 shadow-2xl">
            <div>
              <h2
                id="clear-all-confirm-title"
                className="font-display text-lg font-bold text-white"
              >
                Clear All Songs
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Are you sure you want to permanently remove all{' '}
                <span className="font-semibold text-white">
                  {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
                </span>{' '}
                from Firestore? All categories, moods, and playlist structures will remain intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isClearingAll}
                onClick={() => setConfirmClearAll(false)}
                className="px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.1]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={handleConfirmClearAll}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60"
              >
                {isClearingAll && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Clear All Songs</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
