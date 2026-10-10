import {useEffect, useRef, useState} from 'react';
import type {Media} from './domain';
import {loadYouTubeApi, type YouTubePlayer} from './youtubeApi';

type Props = {media: Media; maskEnabled?: boolean};

export default function VideoPlayer({media, maskEnabled = true}: Props) {
  const useCurtain = media.source === 'youtube';
  const [playing, setPlaying] = useState(true);
  const [concealed, setConcealed] = useState(useCurtain);
  const [loadError, setLoadError] = useState(false);
  const playingRef = useRef(true);
  const concealedRef = useRef(useCurtain);
  const concealUntil = useRef(0);
  const iframe = useRef<HTMLIFrameElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const seekStart = Math.max(0, media.start - 5);

  function conceal() {
    concealedRef.current = true;
    concealUntil.current = performance.now() + 4500;
    setConcealed(true);
  }

  useEffect(() => {
    if (media.source !== 'youtube' || !iframe.current) return;
    concealedRef.current = useCurtain;
    setConcealed(useCurtain);
    setLoadError(false);
    let cancelled = false;
    let monitor: number | undefined;

    void loadYouTubeApi().then(YT => {
      if (cancelled || !iframe.current) return;
      player.current = new YT.Player(iframe.current, {
        events: {
          onReady: ({target}) => {
            if (cancelled) return;
            const element = target.getIframe();
            element.title = 'Demonstração da técnica';
            element.tabIndex = -1;
            element.removeAttribute('allowfullscreen');
            target.mute();
            conceal();
            target.seekTo(seekStart, true);
            if (playingRef.current) target.playVideo();
            monitor = window.setInterval(() => {
              if (target.getPlayerState() !== YT.PlayerState.PLAYING) return;
              const time = target.getCurrentTime();
              const end = media.end ?? target.getDuration();
              if (end > 0 && time >= end - 0.5) {
                conceal();
                target.seekTo(seekStart, true);
                target.playVideo();
              } else if (useCurtain && concealedRef.current && time >= media.start && performance.now() >= concealUntil.current) {
                concealedRef.current = false;
                setConcealed(false);
              }
            }, 200);
          },
          onStateChange: ({target, data}) => {
            if (cancelled || data !== YT.PlayerState.ENDED || !playingRef.current) return;
            conceal();
            target.seekTo(seekStart, true);
            target.playVideo();
          },
        },
      });
    }).catch(() => {
      setLoadError(true);
    });

    return () => {
      cancelled = true;
      window.clearInterval(monitor);
      player.current?.destroy();
      player.current = null;
    };
  }, [media, seekStart, useCurtain]);

  const src = media.source === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${media.videoId}?start=${seekStart}&end=${media.end || 0}&autoplay=1&mute=1&controls=0&fs=0&disablekb=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : media.path;

  function toggle() {
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    if (media.source === 'youtube') {
      if (next) player.current?.playVideo();
      else player.current?.pauseVideo();
    } else if (video.current) {
      if (next) void video.current.play();
      else video.current.pause();
    }
  }

  function restart() {
    playingRef.current = true;
    setPlaying(true);
    if (media.source === 'youtube') {
      conceal();
      player.current?.seekTo(seekStart, true);
      player.current?.playVideo();
    } else if (video.current) {
      video.current.currentTime = media.start;
      void video.current.play();
    }
  }

  return <div className="video-shell">
    <div className="video-frame">
      {media.source === 'youtube'
        ? <iframe ref={iframe} src={src} title="Demonstração da técnica" tabIndex={-1} allow="autoplay; encrypted-media"/>
        : <video ref={video} src={src} controls autoPlay loop playsInline
            onLoadedMetadata={event => {event.currentTarget.currentTime = media.start}}
            onTimeUpdate={event => {if (media.end && event.currentTarget.currentTime >= media.end) event.currentTarget.currentTime = media.start}}/>}
      {maskEnabled && media.mask?.enabled && <div className="name-mask" aria-hidden="true" style={{left: media.mask.left, bottom: media.mask.bottom, width: media.mask.width, height: media.mask.height}}/>}
      {(loadError || (useCurtain && concealed)) && <div className="video-curtain" role="status">{loadError ? 'Vídeo indisponível. Recarregue a página.' : 'Preparando demonstração…'}</div>}
    </div>
    <div className="video-actions">
      <button type="button" onClick={toggle}>{playing ? 'Pausar' : 'Reproduzir'}</button>
      <button type="button" onClick={restart}>Reiniciar trecho</button>
    </div>
  </div>;
}
