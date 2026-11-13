import { Track } from '../../types/music';
import { IMusicProvider, ProviderCallbacks } from './IMusicProvider';

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'));
  }
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve();
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        ytApiPromise = null;
        reject(new Error('Failed to load YouTube IFrame Player API'));
      };
      document.head.appendChild(script);
    }
  });

  return ytApiPromise;
}

export class YouTubeMusicProvider implements IMusicProvider {
  public readonly id = 'youtube' as const;
  public readonly displayName = 'YouTube Official Player';

  private player: YTPlayerInstance | null = null;
  private callbacks: ProviderCallbacks | null = null;
  private progressInterval: number | null = null;
  private isReady = false;
  private pendingTrack: { track: Track; autoplay: boolean } | null = null;
  private currentVolume = 80;
  private isMuted = false;

  public async mount(container: HTMLElement, callbacks: ProviderCallbacks): Promise<void> {
    this.callbacks = callbacks;
    await loadYouTubeIframeAPI();

    if (!window.YT || !window.YT.Player) {
      throw new Error('YouTube Player API failed to initialize');
    }

    // Clear mount point and create child element for YouTube IFrame
    container.innerHTML = '';
    const hostEl = document.createElement('div');
    container.appendChild(hostEl);

    await new Promise<void>((resolve) => {
      this.player = new window.YT!.Player(hostEl, {
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            this.isReady = true;
            this.player?.setVolume(this.currentVolume);
            if (this.isMuted) {
              this.player?.mute();
            }
            this.callbacks?.onReady();
            if (this.pendingTrack) {
              const next = this.pendingTrack;
              this.pendingTrack = null;
              void this.loadTrack(next.track, next.autoplay);
            }
            resolve();
          },
          onStateChange: (event) => {
            this.handleStateChange(event.data);
          },
          onError: (event) => {
            this.handleError(event.data);
          },
        },
      });
    });
  }

  private handleStateChange(state: number): void {
    const YTState = window.YT?.PlayerState;
    if (!YTState || !this.callbacks) return;

    switch (state) {
      case YTState.PLAYING:
        this.callbacks.onStatusChange('playing');
        this.startProgressLoop();
        break;
      case YTState.PAUSED:
        this.callbacks.onStatusChange('paused');
        this.stopProgressLoop();
        this.emitCurrentProgress();
        break;
      case YTState.BUFFERING:
        this.callbacks.onStatusChange('loading');
        break;
      case YTState.ENDED:
        this.callbacks.onStatusChange('ended');
        this.stopProgressLoop();
        this.callbacks.onTrackEnded();
        break;
      case YTState.CUED:
        this.callbacks.onStatusChange('paused');
        this.emitCurrentProgress();
        break;
      default:
        break;
    }
  }

  private handleError(errorCode: number): void {
    this.stopProgressLoop();
    let message = 'This track is currently unavailable for embedded playback.';
    let recoverable = true;

    if (errorCode === 2) {
      message = 'Invalid track identifier.';
    } else if (errorCode === 5) {
      message = 'HTML5 player error encountered.';
    } else if (errorCode === 100) {
      message = 'Track was removed or marked private on YouTube.';
    } else if (errorCode === 101 || errorCode === 150) {
      message = 'Owner disabled embedded playback for this video.';
    } else {
      recoverable = false;
    }

    this.callbacks?.onStatusChange('error');
    this.callbacks?.onError(message, recoverable);
  }

  private emitCurrentProgress(): void {
    if (!this.player || !this.callbacks) return;
    try {
      const current = this.player.getCurrentTime() || 0;
      const duration = this.player.getDuration() || 0;
      this.callbacks.onProgress(current, duration);
    } catch {
      // Player might not be ready yet
    }
  }

  private startProgressLoop(): void {
    this.stopProgressLoop();
    this.emitCurrentProgress();
    this.progressInterval = window.setInterval(() => {
      this.emitCurrentProgress();
    }, 350);
  }

  private stopProgressLoop(): void {
    if (this.progressInterval !== null) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public async loadTrack(track: Track, autoplay = true): Promise<void> {
    if (!this.player || !this.isReady) {
      this.pendingTrack = { track, autoplay };
      return;
    }

    this.callbacks?.onStatusChange('loading');
    this.callbacks?.onProgress(0, track.durationSeconds);

    if (autoplay) {
      this.player.loadVideoById(track.providerTrackId);
    } else {
      this.player.cueVideoById(track.providerTrackId);
    }
  }

  public play(): void {
    this.player?.playVideo();
  }

  public pause(): void {
    this.player?.pauseVideo();
  }

  public seekTo(seconds: number): void {
    if (!this.player || !this.isReady) return;
    this.player.seekTo(seconds, true);
    this.emitCurrentProgress();
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    this.currentVolume = clamped;
    if (this.player && this.isReady) {
      this.player.setVolume(clamped);
    }
  }

  public mute(): void {
    this.isMuted = true;
    if (this.player && this.isReady) {
      this.player.mute();
    }
  }

  public unMute(): void {
    this.isMuted = false;
    if (this.player && this.isReady) {
      this.player.unMute();
    }
  }

  public destroy(): void {
    this.stopProgressLoop();
    try {
      this.player?.destroy();
    } catch {
      // Ignore cleanup failures
    }
    this.player = null;
    this.isReady = false;
  }
}
