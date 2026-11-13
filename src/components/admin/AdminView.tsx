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
  deleteSongFromFirestore,
  seedStarterCatalogIfEmpty,
  verifyAdminAccess,
} from '../../services/catalogService';
import { Track } from '../../types/music';
import { ArtworkImage } from '../ArtworkImage';
import { SongFormModal } from './SongFormModal';

interface AdminViewProps {
  onExitAdmin: () => void;
}

export function AdminView({ onExitAdmin }: AdminViewProps) {
  const { tracks, moods, languages, hasCloudCatalog, getMood } = usePlayer();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [langFilter, setLangFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Auth listener & admin role check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthError(null);
      if (!nextUser) {
        setIsAuthorized(false);
        setAuthLoading(false);
        return;
      }

      const ok = await verifyAdminAccess(
        nextUser.uid,
        nextUser.email,
        nextUser.emailVerified
      );
      setIsAuthorized(ok);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Auto-sync starter catalog to Firestore once when an authorized admin visits
  useEffect(() => {
    if (!isAuthorized || hasCloudCatalog) return;
    let cancelled = false;
    setIsSyncing(true);
    seedStarterCatalogIfEmpty()
      .then((res) => {
        if (!cancelled && res.seededSongs > 0) {
          setFeedbackMessage(
            `Synced ${res.seededSongs} starter songs to Firestore.`
          );
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
  }, [hasCloudCatalog, isAuthorized]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in was cancelled or blocked.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleManualSync = async () => {
    setActionError(null);
    setIsSyncing(true);
    try {
      const res = await seedStarterCatalogIfEmpty();
      if (res.seededSongs > 0 || res.seededMoods > 0) {
        setFeedbackMessage(
          `Synced ${res.seededSongs} songs, ${res.seededMoods} moods, and ${res.seededLanguages} languages.`
        );
      } else {
        setFeedbackMessage('Cloud catalog is already synced.');
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to sync starter catalog.'
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
        <div className="flex items-center gap-3 text-slate-300 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated gate
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 sm:py-20">
        <div className="rounded-2xl border border-white/[0.1] bg-[#0D1018] p-6 sm:p-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Admin Sign In
            </h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Sign in with an authorized administrator Google account to manage Sona&apos;s songs, moods, languages, and uploaded media.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200"
            >
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full h-12 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isSigningIn && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full h-11 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sona</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but unauthorized
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-12 sm:py-20">
        <div className="rounded-2xl border border-amber-500/25 bg-[#0D1018] p-6 sm:p-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Access Restricted
            </h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Signed in as <span className="text-slate-200">{user.email}</span>. This account does not have administrator privileges for this workspace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 h-11 rounded-xl text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="flex-1 h-11 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.1] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
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
          <p className="text-xs font-medium text-indigo-400">
            Protected Admin Route · {user.email}
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Admin Studio
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Manage songs, moods, languages, and authorized media across the live application.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!hasCloudCatalog && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs sm:text-sm font-medium text-indigo-200 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 whitespace-nowrap"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              <span>Sync Starter Catalog</span>
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
            <span>Sign Out</span>
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
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1018] p-5">
          <p className="text-xs font-medium text-slate-400">Total Songs</p>
          <p className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {tracks.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {hasCloudCatalog ? 'Live in Firestore' : 'Starter catalog'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1018] p-5">
          <p className="text-xs font-medium text-slate-400">Mood Categories</p>
          <p className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {moods.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Active mood discovery channels
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1018] p-5">
          <p className="text-xs font-medium text-slate-400">Languages</p>
          <p className="mt-2 font-display text-3xl font-bold text-white tabular-nums">
            {languages.length}
          </p>
          <p className="mt-1 text-xs text-slate-400 truncate">
            {languages.join(' · ')}
          </p>
        </div>
      </div>

      {/* Search, Filter & Add Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-1 gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs by title, artist, album, or ID..."
              aria-label="Filter songs"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/[0.1] bg-[#0D1018] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            aria-label="Filter by mood"
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#0D1018] text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
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
            className="h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#0D1018] text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
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
          className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Song</span>
        </button>
      </div>

      {/* Song Management Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0B0E16] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between text-xs text-slate-400">
          <span className="tabular-nums">
            Showing {filteredSongs.length} of {tracks.length} songs
          </span>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-display text-base font-semibold text-white">
              No songs match your filters
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Adjust your search or click &ldquo;Add New Song&rdquo; to publish a track.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-xs font-medium text-slate-400">
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
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/[0.08] bg-[#141724]">
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
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0D1018] p-6 space-y-5 shadow-2xl">
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
    </div>
  );
}
