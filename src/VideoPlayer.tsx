import {useEffect, useRef, useState} from 'react';
import type {Media} from './domain';
import {loadYouTubeApi, type YouTubePlayer} from './youtubeApi';
import {Icon} from './ui';

type Props = {media: Media; maskEnabled?: boolean};

export default function VideoPlayer(props: Props) {
  return props.media.source === 'local' ? <LocalPlayer {...props}/> : <YouTubePlayerFrame {...props}/>;
}

const playerTitle = 'Demonstração da técnica';

function NameMask({media, maskEnabled}: Props) {
  const mask = media.mask;
  return maskEnabled && mask?.enabled
    ? <div className="name-mask" aria-hidden="true" style={{left: mask.left, bottom: mask.bottom, width: mask.width, height: mask.height}}/>
    : null;
}

function Curtain({error}: {error: boolean}) {
  return <div className="video-curtain" role="status">
    <Icon name={error ? 'alert' : 'clock'} size={28}/>
    <strong>{error ? 'Vídeo indisponível' : 'Preparando demonstração…'}</strong>
    <span>{error ? 'Tente reiniciar o trecho.' : 'Aguarde o início do trecho.'}</span>
  </div>;
}

function PlayerActions({playing, toggle, restart, error}: {
  playing: boolean; toggle: () => void; restart: () => void; error: boolean;
}) {
  return <div className="video-actions">
    <button type="button" disabled={error} onClick={toggle}>
      <Icon name={playing ? 'pause' : 'play'} size={17}/>{playing ? 'Pausar' : 'Reproduzir'}
    </button>
    <button type="button" onClick={restart}><Icon name="replay" size={17}/>Reiniciar trecho</button>
  </div>;
}

function LocalPlayer({media, maskEnabled = true}: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const shouldPlay = useRef(true);
  const [playing, setPlaying] = useState(true);
  const [prepared, setPrepared] = useState(false);
  const [error, setError] = useState(false);
  const src = media.path && `${import.meta.env.BASE_URL}${media.path.replace(/^\/+/, '')}`;

  function play(element: HTMLVideoElement) {
    void element.play()?.catch(() => {
      shouldPlay.current = false;
      setPlaying(false);
    });
  }

  function seekStart(element: HTMLVideoElement) {
    setPrepared(false);
    if (element.currentTime !== media.start) element.currentTime = media.start;
    else if (element.readyState >= 2) setPrepared(true);
  }

  useEffect(() => {
    const element = video.current;
    if (!element || !element.requestVideoFrameCallback || media.end === undefined) return;
    const end = media.end;
    let callback = 0;
    function watch(_: DOMHighResTimeStamp, frame: VideoFrameCallbackMetadata) {
      if (!element) return;
      if (!element.seeking && frame.mediaTime >= end - 0.09) seekStart(element);
      callback = element.requestVideoFrameCallback(watch);
    }
    callback = element.requestVideoFrameCallback(watch);
    return () => element.cancelVideoFrameCallback(callback);
  }, [media.start, media.end]);

  function reveal(element: HTMLVideoElement) {
    if (!element.seeking && element.currentTime >= media.start &&
      (media.end === undefined || element.currentTime < media.end)) setPrepared(true);
  }

  function toggle() {
    const element = video.current;
    if (!element) return;
    shouldPlay.current = !shouldPlay.current;
    setPlaying(shouldPlay.current);
    if (shouldPlay.current) play(element);
    else element.pause();
  }

  function restart() {
    const element = video.current;
    if (!element) return;
    shouldPlay.current = true;
    setPlaying(true);
    if (error) {
      setError(false);
      setPrepared(false);
      element.load();
    } else {
      seekStart(element);
      play(element);
    }
  }

  return <div className="video-shell">
    <div className="video-frame" onContextMenu={event => event.preventDefault()}>
      <video ref={video} src={src} title={playerTitle} tabIndex={-1} playsInline muted
        disablePictureInPicture disableRemotePlayback preload="auto"
        style={{visibility: prepared && !error ? 'visible' : 'hidden'}}
        onLoadedMetadata={event => {
          seekStart(event.currentTarget);
          if (shouldPlay.current) play(event.currentTarget);
        }}
        onLoadedData={event => reveal(event.currentTarget)}
        onSeeking={() => setPrepared(false)}
        onSeeked={event => reveal(event.currentTarget)}
        onTimeUpdate={event => {
          const element = event.currentTarget;
          if (media.end !== undefined && element.currentTime >= media.end) seekStart(element);
        }}
        onEnded={event => {
          const element = event.currentTarget;
          seekStart(element);
          if (shouldPlay.current) play(element);
        }}
        onError={() => {setPrepared(false); setError(true)}}
      />
      <NameMask media={media} maskEnabled={maskEnabled}/>
      {(!prepared || error) && <Curtain error={error}/>}
    </div>
    <PlayerActions playing={playing} toggle={toggle} restart={restart} error={error}/>
  </div>;
}

function YouTubePlayerFrame({media, maskEnabled = true}: Props) {
  const [playing, setPlaying] = useState(true);
  const [concealed, setConcealed] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const playingRef = useRef(true);
  const concealedRef = useRef(true);
  const concealUntil = useRef(0);
  const iframe = useRef<HTMLIFrameElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const [attempt, setAttempt] = useState(0);
  const seekStart = Math.max(0, media.start - 5);

  function conceal() {
    concealedRef.current = true;
    concealUntil.current = performance.now() + 4500;
    setConcealed(true);
  }

  useEffect(() => {
    if (!iframe.current) return;
    concealedRef.current = true;
    setConcealed(true);
    setLoadError(false);
    let cancelled = false;
    let monitor: number | undefined;
    const startup = window.setTimeout(() => setLoadError(true), 15000);

    function fail() {
      window.clearTimeout(startup);
      window.clearInterval(monitor);
      if (!cancelled) setLoadError(true);
    }

    void loadYouTubeApi().then(YT => {
      if (cancelled || !iframe.current) return;
      player.current = new YT.Player(iframe.current, {
        events: {
          onReady: ({target}) => {
            if (cancelled) return;
            window.clearTimeout(startup);
            setLoadError(false);
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
              } else if (concealedRef.current && time >= media.start && performance.now() >= concealUntil.current) {
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
          onError: fail,
        },
      });
    }).catch(fail);

    return () => {
      cancelled = true;
      window.clearTimeout(startup);
      window.clearInterval(monitor);
      player.current?.destroy();
      player.current = null;
    };
  }, [media, seekStart, attempt]);

  const src = `https://www.youtube-nocookie.com/embed/${media.videoId}?start=${seekStart}&end=${media.end || 0}&autoplay=1&mute=1&controls=0&fs=0&disablekb=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;

  function toggle() {
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    if (next) player.current?.playVideo();
    else player.current?.pauseVideo();
  }

  function restart() {
    playingRef.current = true;
    setPlaying(true);
    conceal();
    if (loadError) {
      setLoadError(false);
      setAttempt(value => value + 1);
    } else {
      player.current?.seekTo(seekStart, true);
      player.current?.playVideo();
    }
  }

  return <div className="video-shell">
    <div className="video-frame">
      <iframe key={attempt} ref={iframe} src={src} title={playerTitle} tabIndex={-1} aria-hidden="true" allow="autoplay; encrypted-media"/>
      <NameMask media={media} maskEnabled={maskEnabled}/>
      {(loadError || concealed) && <Curtain error={loadError}/>}
    </div>
    <PlayerActions playing={playing} toggle={toggle} restart={restart} error={loadError}/>
  </div>;
}
