import { Track } from '../../types/music';
import { IMusicProvider, ProviderCallbacks } from './IMusicProvider';

export class HtmlAudioMusicProvider implements IMusicProvider {
  public readonly id = 'audio' as const;
  public readonly displayName = 'Authorized Audio Stream';

  private audio: HTMLAudioElement | null = null;
  private callbacks: ProviderCallbacks | null = null;
  private currentVolume = 80;
  private isMuted = false;

  public async mount(_container: HTMLElement, callbacks: ProviderCallbacks): Promise<void> {
    this.callbacks = callbacks;
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = this.currentVolume / 100;
    audio.muted = this.isMuted;

    audio.addEventListener('playing', () => {
      this.callbacks?.onStatusChange('playing');
    });

    audio.addEventListener('pause', () => {
      if (!audio.ended) {
        this.callbacks?.onStatusChange('paused');
      }
    });

    audio.addEventListener('waiting', () => {
      this.callbacks?.onStatusChange('loading');
    });

    audio.addEventListener('canplay', () => {
      if (!audio.paused) {
        this.callbacks?.onStatusChange('playing');
      } else {
        this.callbacks?.onStatusChange('paused');
      }
      this.emitProgress();
    });

    audio.addEventListener('timeupdate', () => {
      this.emitProgress();
    });

    audio.addEventListener('loadedmetadata', () => {
      this.emitProgress();
    });

    audio.addEventListener('ended', () => {
      this.callbacks?.onStatusChange('ended');
      this.callbacks?.onTrackEnded();
    });

    audio.addEventListener('error', () => {
      this.callbacks?.onStatusChange('error');
      this.callbacks?.onError(
        'Unable to stream this authorized audio source. Check the audio file URL or format.',
        true
      );
    });

    this.audio = audio;
    this.callbacks?.onReady();
  }

  private emitProgress(): void {
    if (!this.audio || !this.callbacks) return;
    const current = Number.isFinite(this.audio.currentTime)
      ? this.audio.currentTime
      : 0;
    const duration = Number.isFinite(this.audio.duration)
      ? this.audio.duration
      : 0;
    this.callbacks.onProgress(current, duration);
  }

  public async loadTrack(track: Track, autoplay = true): Promise<void> {
    if (!this.audio) return;
    const src = track.audioUrl || track.providerTrackId;
    if (!src) {
      this.callbacks?.onStatusChange('error');
      this.callbacks?.onError('Missing authorized audio URL.', true);
      return;
    }

    this.callbacks?.onStatusChange('loading');
    this.callbacks?.onProgress(0, track.durationSeconds);

    this.audio.src = src;
    this.audio.load();

    if (autoplay) {
      try {
        await this.audio.play();
      } catch {
        this.callbacks?.onStatusChange('paused');
      }
    }
  }

  public play(): void {
    if (!this.audio) return;
    void this.audio.play().catch(() => {
      this.callbacks?.onStatusChange('error');
      this.callbacks?.onError('Playback was blocked by the browser.', true);
    });
  }

  public pause(): void {
    this.audio?.pause();
  }

  public seekTo(seconds: number): void {
    if (!this.audio) return;
    const safeSeconds = Math.max(0, seconds);
    this.audio.currentTime = safeSeconds;
    this.emitProgress();
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    this.currentVolume = clamped;
    if (this.audio) {
      this.audio.volume = clamped / 100;
    }
  }

  public mute(): void {
    this.isMuted = true;
    if (this.audio) {
      this.audio.muted = true;
    }
  }

  public unMute(): void {
    this.isMuted = false;
    if (this.audio) {
      this.audio.muted = false;
    }
  }

  public destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}
