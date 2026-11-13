export type MoodId =
  | 'workout'
  | 'chill'
  | 'sad'
  | 'romantic'
  | 'travel'
  | 'motivation'
  | 'focus'
  | 'party'
  | 'devotional'
  | 'peaceful';

export type SectionView =
  | 'home'
  | 'explore'
  | 'search'
  | 'recent'
  | 'favourites';

export type ProviderType = 'youtube';

export type TrackLanguage = 'Hindi' | 'Marathi' | 'English' | 'Instrumental';

export type LanguageFilter = 'All' | TrackLanguage;

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
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  language: TrackLanguage;
  moodId: MoodId;
  provider: ProviderType;
  providerTrackId: string;
  durationLabel: string;
  durationSeconds: number;
  isLive?: boolean;
  artworkUrl: string;
  fallbackArtwork: string;
  year?: string;
  keywords: string[];
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
