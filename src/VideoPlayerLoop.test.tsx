import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';
import {media} from './content';
import VideoPlayer from './VideoPlayer';
import {loadYouTubeApi, type YouTubeApi, type YouTubePlayer} from './youtubeApi';

vi.mock('./youtubeApi', () => ({loadYouTubeApi: vi.fn()}));
afterEach(() => {cleanup(); vi.useRealTimers(); vi.clearAllMocks()});

it('volta ao segundo configurado antes do fim e também se o player terminar', async () => {
  vi.useFakeTimers();
  let currentTime = 69.6;
  let onReady: ((event: {target: YouTubePlayer; data: number}) => void) | undefined;
  let onStateChange: typeof onReady;
  const player = {
    playVideo: vi.fn(), pauseVideo: vi.fn(), seekTo: vi.fn(),
    getCurrentTime: () => currentTime, getDuration: () => 100, getPlayerState: () => 1,
    getIframe: () => document.querySelector('.video-frame iframe') as HTMLIFrameElement,
    mute: vi.fn(), destroy: vi.fn(),
  } as YouTubePlayer;
  const Player = vi.fn().mockImplementation((_element, options) => {
    onReady = options.events.onReady;
    onStateChange = options.events.onStateChange;
    return player;
  }) as unknown as YouTubeApi['Player'];
  vi.mocked(loadYouTubeApi).mockResolvedValue({Player, PlayerState: {ENDED: 0, PLAYING: 1}});

  let view: ReturnType<typeof render>;
  await act(async () => {view = render(<VideoPlayer media={media[0]}/>); await Promise.resolve()});
  act(() => onReady?.({target: player, data: 1}));
  expect(player.seekTo).toHaveBeenCalledWith(0, true);
  vi.mocked(player.seekTo).mockClear();
  act(() => vi.advanceTimersByTime(200));
  expect(player.seekTo).toHaveBeenCalledWith(0, true);
  expect(screen.getByText('Preparando demonstração…')).toBeDefined();
  vi.mocked(player.seekTo).mockClear();
  currentTime = 5.2;
  act(() => vi.advanceTimersByTime(4700));
  expect(screen.queryByText('Preparando demonstração…')).toBeNull();
  currentTime = 10;
  act(() => onStateChange?.({target: player, data: 0}));
  expect(player.seekTo).toHaveBeenCalledWith(0, true);
  fireEvent.click(screen.getByText('Pausar'));
  expect(player.pauseVideo).toHaveBeenCalled();

  currentTime = 99.6;
  vi.mocked(player.seekTo).mockClear();
  await act(async () => {view.rerender(<VideoPlayer media={media.find(item => item.id === 'kenka-yotsu-kodokan')!}/>); await Promise.resolve()});
  expect(screen.getByText('Preparando demonstração…')).toBeDefined();
  act(() => onReady?.({target: player, data: 1}));
  vi.mocked(player.seekTo).mockClear();
  act(() => vi.advanceTimersByTime(200));
  expect(player.seekTo).toHaveBeenCalledWith(90, true);
});
