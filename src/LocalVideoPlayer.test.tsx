import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';
import type { Media } from './domain';

const local: Media = {
  id: 'question-video', source: 'local', path: 'study-media/yhu1mfy2vJ4',
  start: 5, end: 70, mask: {enabled: true, left: '0%', bottom: '5%', width: '34%', height: '16%'},
};

afterEach(() => {cleanup(); vi.restoreAllMocks()});

it('exibe o trecho local assim que a busca termina, sem tela de preparação', () => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  const {container} = render(<VideoPlayer media={local}/>);
  const video = screen.getByTitle('Demonstração da técnica') as HTMLVideoElement;
  expect(video.muted).toBe(true);
  expect(video.controls).toBe(false);
  expect(video.src).toContain('/study-media/yhu1mfy2vJ4');
  expect(container.querySelector('iframe')).toBeNull();
  expect(container.querySelector('.name-mask')).not.toBeNull();
  expect(video.style.visibility).toBe('hidden');
  expect(screen.queryByText('Preparando demonstração…')).toBeNull();

  fireEvent.loadedMetadata(video);
  expect(video.currentTime).toBe(5);
  expect(video.style.visibility).toBe('hidden');
  expect(screen.queryByText('Preparando demonstração…')).toBeNull();
  fireEvent.seeked(video);
  expect(video.style.visibility).toBe('visible');

  video.currentTime = 70;
  fireEvent.timeUpdate(video);
  expect(video.currentTime).toBe(5);
  expect(video.style.visibility).toBe('hidden');
  expect(screen.queryByText('Preparando demonstração…')).toBeNull();
});

it('permite repetir a tentativa sem reiniciar o quiz após um erro local', () => {
  const load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  render(<VideoPlayer media={local}/>);
  fireEvent.error(screen.getByTitle('Demonstração da técnica'));
  expect(screen.getByText('Vídeo indisponível')).toBeDefined();
  expect((screen.getByRole('button', {name: 'Pausar'}) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', {name: 'Reiniciar trecho'}));
  expect(load).toHaveBeenCalledOnce();
  expect(screen.queryByText('Vídeo indisponível')).toBeNull();
  expect(screen.queryByText('Preparando demonstração…')).toBeNull();
});
