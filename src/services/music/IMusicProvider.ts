import { PlaybackStatus, ProviderType, Track } from '../../types/music';

export interface ProviderCallbacks {
  onReady: () => void;
  onStatusChange: (status: PlaybackStatus) => void;
  onProgress: (currentTime: number, duration: number) => void;
  onError: (message: string, recoverable: boolean) => void;
  onTrackEnded: () => void;
}

/**
 * Modular music provider interface.
 * Swap or add licensed providers (e.g. Spotify, Apple MusicKit, SoundCloud)
 * by implementing this contract without modifying UI or PlayerContext.
 */
export interface IMusicProvider {
  readonly id: ProviderType;
  readonly displayName: string;
  mount(container: HTMLElement, callbacks: ProviderCallbacks): Promise<void>;
  loadTrack(track: Track, autoplay?: boolean): Promise<void>;
  play(): void;
  pause(): void;
  seekTo(seconds: number): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
}
