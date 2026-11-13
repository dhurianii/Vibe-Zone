export type MoodId =
  | 'workout'
  | 'chill'
  | 'sad'
  | 'romantic'
  | 'travel'
  | 'focus'
  | 'party'
  | 'devotional'
  | 'peaceful';

export type SectionView =
  | 'home'
  | 'explore'
  | 'search'
  | 'recent'
  | 'favourites'
  | 'admin';

export type ProviderType = 'youtube' | 'audio' | 'pending';

export type TrackLanguage = string;

export type LanguageFilter = 'All' | TrackLanguage;

export const DEFAULT_LANGUAGES: TrackLanguage[] = [
  'Hindi',
  'Marathi',
  'English',
  'Instrumental',
];

export interface MoodCategory {
  id: MoodId;
  name: string;
  emoji: string;
  description: string;
  curatorNote: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  coverImage: string;
  sortOrder?: number;
}

export interface LanguageOption {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  description?: string;
  language: TrackLanguage;
  moodId: MoodId;
  provider: ProviderType;
  providerTrackId: string;
  audioUrl?: string;
  durationLabel: string;
  durationSeconds: number;
  isLive?: boolean;
  artworkUrl: string;
  fallbackArtwork: string;
  year?: string;
  keywords: string[];
  createdBy?: string;
}

export type PlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export interface RecentPlayEntry {
  trackId: string;
  playedAt: number;
}
