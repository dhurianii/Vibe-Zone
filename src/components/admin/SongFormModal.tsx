import { Image as ImageIcon, Loader2, Music, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  SongInput,
  createSongInFirestore,
  extractYouTubeVideoId,
  findDuplicateSong,
  parseDurationToSeconds,
  updateSongInFirestore,
  uploadArtworkFile,
  uploadAuthorizedAudioFile,
} from '../../services/catalogService';
import {
  MoodCategory,
  MoodId,
  ProviderType,
  Track,
} from '../../types/music';
import { ArtworkImage } from '../ArtworkImage';

interface SongFormModalProps {
  isOpen: boolean;
  editingTrack: Track | null;
  existingTracks: Track[];
  moods: MoodCategory[];
  languages: string[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function SongFormModal({
  isOpen,
  editingTrack,
  existingTracks,
  moods,
  languages,
  onClose,
  onSuccess,
}: SongFormModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [customLanguage, setCustomLanguage] = useState('');
  const [moodId, setMoodId] = useState<MoodId>('chill');
  const [provider, setProvider] = useState<ProviderType>('youtube');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [durationLabel, setDurationLabel] = useState('3:30');
  const [isLive, setIsLive] = useState(false);

  const [isUploadingArt, setIsUploadingArt] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (editingTrack) {
      setTitle(editingTrack.title);
      setArtist(editingTrack.artist);
      setAlbum(editingTrack.album ?? '');
      setDescription(editingTrack.description ?? '');
      const knownLang = languages.includes(editingTrack.language);
      setLanguage(knownLang ? editingTrack.language : '__custom__');
      setCustomLanguage(knownLang ? '' : editingTrack.language);
      const safeMoodId =
        (editingTrack.moodId as string) === 'motivation'
          ? 'workout'
          : editingTrack.moodId;
      setMoodId(safeMoodId);
      setProvider(editingTrack.provider);
      setYoutubeInput(
        editingTrack.provider === 'youtube' ? editingTrack.providerTrackId : ''
      );
      setAudioUrl(
        editingTrack.provider === 'audio'
          ? editingTrack.audioUrl || editingTrack.providerTrackId
          : ''
      );
      setArtworkUrl(editingTrack.artworkUrl);
      setDurationLabel(editingTrack.isLive ? 'LIVE' : editingTrack.durationLabel);
      setIsLive(Boolean(editingTrack.isLive));
    } else {
      setTitle('');
      setArtist('');
      setAlbum('');
      setDescription('');
      setLanguage(languages[0] ?? 'Hindi');
      setCustomLanguage('');
      setMoodId(moods[0]?.id ?? 'workout');
      setProvider('youtube');
      setYoutubeInput('');
      setAudioUrl('');
      setArtworkUrl('');
      setDurationLabel('3:30');
      setIsLive(false);
    }
  }, [editingTrack, isOpen, languages, moods]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const resolvedYoutubeId =
    provider === 'youtube' ? extractYouTubeVideoId(youtubeInput) : '';
  const previewArtwork =
    artworkUrl.trim() ||
    (provider === 'youtube' && /^[a-zA-Z0-9_-]{11}$/.test(resolvedYoutubeId)
      ? `https://i.ytimg.com/vi/${resolvedYoutubeId}/hqdefault.jpg`
      : moods.find((m) => m.id === moodId)?.coverImage ?? '');

  const handleArtworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploadingArt(true);
    try {
      const url = await uploadArtworkFile(file);
      setArtworkUrl(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to upload artwork image to Firebase Storage.'
      );
    } finally {
      setIsUploadingArt(false);
      e.target.value = '';
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploadingAudio(true);
    try {
      // Detect duration locally before upload completes
      const objectUrl = URL.createObjectURL(file);
      const probe = new Audio(objectUrl);
      probe.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(probe.duration) && probe.duration > 0) {
          const mins = Math.floor(probe.duration / 60);
          const secs = Math.floor(probe.duration % 60);
          setDurationLabel(`${mins}:${String(secs).padStart(2, '0')}`);
          setIsLive(false);
        }
        URL.revokeObjectURL(objectUrl);
      });

      const url = await uploadAuthorizedAudioFile(file);
      setAudioUrl(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to upload audio file to Firebase Storage.'
      );
    } finally {
      setIsUploadingAudio(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    const resolvedLanguage =
      language === '__custom__' ? customLanguage.trim() : language.trim();

    if (!cleanTitle) {
      setError('Song title is required.');
      return;
    }
    if (!cleanArtist) {
      setError('Artist name is required.');
      return;
    }
    if (!resolvedLanguage) {
      setError('Music language is required.');
      return;
    }

    let providerTrackId = '';
    let resolvedAudioUrl = '';

    if (provider === 'youtube') {
      const ytId = extractYouTubeVideoId(youtubeInput);
      if (!ytId || !/^[a-zA-Z0-9_-]{11}$/.test(ytId)) {
        setError(
          'Please enter a valid 11-character YouTube Video ID or a full YouTube watch URL.'
        );
        return;
      }
      providerTrackId = ytId;
    } else if (provider === 'audio') {
      const cleanAudio = audioUrl.trim();
      if (!cleanAudio) {
        setError(
          'Please provide an authorized audio URL or upload an authorized audio file.'
        );
        return;
      }
      try {
        new URL(cleanAudio);
      } catch {
        setError('Please enter a valid https:// authorized audio URL.');
        return;
      }
      providerTrackId = cleanAudio;
      resolvedAudioUrl = cleanAudio;
    } else {
      providerTrackId = 'SOURCE_PENDING';
    }

    const finalArtwork =
      artworkUrl.trim() ||
      (provider === 'youtube'
        ? `https://i.ytimg.com/vi/${providerTrackId}/hqdefault.jpg`
        : moods.find((m) => m.id === moodId)?.coverImage ?? '');

    const finalDurationLabel =
      provider === 'pending'
        ? durationLabel.trim() || '--:--'
        : isLive
          ? 'LIVE'
          : durationLabel.trim() || '3:30';
    const finalDurationSeconds =
      provider === 'pending' || isLive
        ? 0
        : parseDurationToSeconds(finalDurationLabel) || 210;

    const moodObj = moods.find((m) => m.id === moodId);
    const keywords = Array.from(
      new Set(
        [
          moodId,
          moodObj?.name.toLowerCase() ?? '',
          resolvedLanguage.toLowerCase(),
          ...cleanTitle.toLowerCase().split(/\s+/).slice(0, 4),
          ...cleanArtist.toLowerCase().split(/\s+/).slice(0, 3),
        ].filter(Boolean)
      )
    ).slice(0, 18);

    const payload: SongInput = {
      title: cleanTitle,
      artist: cleanArtist,
      album: album.trim() || undefined,
      description: description.trim() || undefined,
      language: resolvedLanguage,
      moodId,
      provider,
      providerTrackId,
      audioUrl: resolvedAudioUrl || undefined,
      artworkUrl: finalArtwork,
      durationLabel: finalDurationLabel,
      durationSeconds: finalDurationSeconds,
      isLive,
      keywords,
    };

    const duplicate = findDuplicateSong(
      payload,
      existingTracks,
      editingTrack?.id
    );
    if (duplicate) {
      setError(
        `Duplicate detected: "${duplicate.title}" by ${duplicate.artist} already exists in this catalog.`
      );
      return;
    }

    setIsSaving(true);
    try {
      if (editingTrack) {
        await updateSongInFirestore(editingTrack.id, payload);
        onSuccess(`Updated "${cleanTitle}".`);
      } else {
        await createSongInFirestore(payload);
        onSuccess(`Added "${cleanTitle}" to ${moodObj?.name ?? moodId}.`);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save song. Verify your admin permissions.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-[#9D4EDD]/30 bg-[#0F1118] shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2
            id="song-modal-title"
            className="font-display text-lg sm:text-xl font-bold text-white"
          >
            {editingTrack ? 'Edit Song' : 'Add New Song'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs sm:text-sm text-rose-200"
            >
              {error}
            </div>
          )}

          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-300">
                Song Title *
              </span>
              <input
                type="text"
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kesariya"
                className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#A1A1AA]">
                Artist Name *
              </span>
              <input
                type="text"
                required
                maxLength={160}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Arijit Singh"
                className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00]"
              />
            </label>
          </div>

          {/* Album, Mood, Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#A1A1AA]">
                Album Name (Optional)
              </span>
              <input
                type="text"
                maxLength={160}
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="e.g. Brahmāstra"
                className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#A1A1AA]">
                Mood Category *
              </span>
              <select
                value={moodId}
                onChange={(e) => setMoodId(e.target.value as MoodId)}
                className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white focus:outline-none focus:border-[#B6FF00]"
              >
                {moods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.emoji} {m.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#A1A1AA]">
                Music Language *
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white focus:outline-none focus:border-[#B6FF00]"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
                <option value="__custom__">+ Add Custom Language</option>
              </select>
            </label>
          </div>

          {language === '__custom__' && (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#A1A1AA]">
                Custom Language Name *
              </span>
              <input
                type="text"
                required
                maxLength={40}
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="e.g. Punjabi, Tamil, Classical"
                className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00]"
              />
            </label>
          )}

          {/* Music Provider & Source */}
          <div className="rounded-xl border border-white/[0.08] bg-[#08090D]/60 p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#A1A1AA]">
                  Music Provider *
                </span>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as ProviderType)}
                  className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white focus:outline-none focus:border-[#B6FF00]"
                >
                  <option value="youtube">YouTube Official IFrame API</option>
                  <option value="audio">Authorized Audio File / URL</option>
                  <option value="pending">Source Pending (Save without link yet)</option>
                </select>
              </label>

              <div className="flex items-end gap-3">
                <label className="block flex-1 space-y-1.5">
                  <span className="text-xs font-medium text-[#A1A1AA]">
                    Duration (mm:ss)
                  </span>
                  <input
                    type="text"
                    disabled={isLive || provider === 'pending'}
                    value={
                      provider === 'pending'
                        ? '--:--'
                        : isLive
                          ? 'LIVE'
                          : durationLabel
                    }
                    onChange={(e) => setDurationLabel(e.target.value)}
                    placeholder="3:45"
                    className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] font-mono text-sm text-white disabled:opacity-50 focus:outline-none focus:border-[#B6FF00]"
                  />
                </label>

                <label className="inline-flex items-center gap-2 h-11 px-3 rounded-xl border border-white/[0.1] bg-[#08090D] text-xs text-[#A1A1AA] cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isLive}
                    disabled={provider === 'pending'}
                    onChange={(e) => setIsLive(e.target.checked)}
                    className="rounded border-white/20 text-[#B6FF00] focus:ring-[#B6FF00]"
                  />
                  <span>Live Stream</span>
                </label>
              </div>
            </div>

            {provider === 'youtube' ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#A1A1AA]">
                  YouTube Video ID or URL *
                </span>
                <input
                  type="text"
                  required
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="e.g. BddP6PYo2gs or https://www.youtube.com/watch?v=BddP6PYo2gs"
                  className="w-full h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] font-mono text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00]"
                />
                {resolvedYoutubeId && (
                  <p className="text-xs text-[#C77DFF]">
                    Detected Video ID: <span className="font-mono">{resolvedYoutubeId}</span>
                  </p>
                )}
              </label>
            ) : provider === 'audio' ? (
              <div className="space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#A1A1AA]">
                    Authorized Audio URL or Upload to Storage *
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="url"
                      required
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://... (MP3, WAV, OGG, M4A)"
                      className="flex-1 h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00]"
                    />
                    <label className="inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white cursor-pointer whitespace-nowrap shrink-0">
                      {isUploadingAudio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Music className="w-4 h-4" />
                      )}
                      <span>{isUploadingAudio ? 'Uploading...' : 'Upload Audio'}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        disabled={isUploadingAudio}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 leading-relaxed">
                This song will be saved as <span className="font-semibold">Source Pending</span> until you switch the provider above to YouTube or Authorized Audio and attach a verified source link.
              </div>
            )}
          </div>

          {/* Cover Artwork URL or Image Upload */}
          <div className="rounded-xl border border-white/[0.08] bg-[#08090D]/60 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/[0.1] bg-[#0F1118] flex items-center justify-center">
              {previewArtwork ? (
                <ArtworkImage
                  src={previewArtwork}
                  alt="Artwork preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-[#A1A1AA]" />
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <span className="block text-xs font-medium text-[#A1A1AA]">
                Cover Artwork URL or Upload Image
              </span>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="url"
                  value={artworkUrl}
                  onChange={(e) => setArtworkUrl(e.target.value)}
                  placeholder="Optional for YouTube (auto-uses thumbnail) or paste image URL"
                  className="flex-1 h-11 px-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00]"
                />
                <label className="inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white cursor-pointer whitespace-nowrap shrink-0">
                  {isUploadingArt ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isUploadingArt ? 'Uploading...' : 'Upload Cover'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleArtworkUpload}
                    disabled={isUploadingArt}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Optional Description */}
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#A1A1AA]">
              Description (Optional)
            </span>
            <textarea
              rows={2}
              maxLength={600}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional mood notes, composer credits, or context..."
              className="w-full p-3.5 rounded-xl border border-white/[0.1] bg-[#08090D] text-sm text-white placeholder:text-[#A1A1AA]/55 focus:outline-none focus:border-[#B6FF00] resize-none"
            />
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploadingArt || isUploadingAudio}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold text-[#08090D] bg-[#B6FF00] hover:brightness-110 disabled:opacity-60 shadow-[0_6px_20px_rgba(182,255,0,0.22)]"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingTrack ? 'Save Changes' : 'Add Song'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
