export type YouTubePlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getIframe(): HTMLIFrameElement;
  mute(): void;
  destroy(): void;
};

type PlayerEvent = {target: YouTubePlayer; data: number};
export type YouTubeApi = {
  Player: new (element: HTMLIFrameElement, options: {events: {
    onReady: (event: PlayerEvent) => void;
    onStateChange: (event: PlayerEvent) => void;
  }}) => YouTubePlayer;
  PlayerState: {ENDED: number; PLAYING: number};
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | undefined;

export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error('A API do YouTube não ficou disponível.'));
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        apiPromise = undefined;
        reject(new Error('Não foi possível carregar a API do YouTube.'));
      };
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}
