import {describe,expect,it} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/react';
import VideoPlayer from './VideoPlayer';
import {media} from './content';
describe('player de demonstração',()=>{
 it('mantém o começo oculto, sem loop nativo, e permite controlar a reprodução',()=>{const {container}=render(<VideoPlayer media={media[0]}/>);const frame=screen.getByTitle('Demonstração da técnica') as HTMLIFrameElement;expect(frame.src).toContain('start=0');expect(frame.src).not.toContain('loop=1');expect(frame.src).toContain('controls=0');expect(frame.src).toContain('fs=0');expect(frame.hasAttribute('allowfullscreen')).toBe(false);expect(frame.tabIndex).toBe(-1);expect(container.querySelector('.name-mask')).not.toBeNull();expect(container.querySelector('.title-mask')).toBeNull();expect(screen.getByText('Preparando demonstração…')).toBeDefined();fireEvent.click(screen.getByText('Pausar'));expect(screen.getByText('Reproduzir')).toBeDefined()});
 it('não mostra a cobertura quando desativada',()=>{const {container}=render(<VideoPlayer media={media[0]} maskEnabled={false}/>);expect(container.querySelector('.name-mask')).toBeNull()});
 it('prepara também os trechos de ukemi antes de revelar o vídeo',()=>{const ukemi=media.find(item=>item.id==='ushiro-ukemi-kodokan')!;render(<VideoPlayer media={ukemi}/>);const frame=screen.getByTitle('Demonstração da técnica') as HTMLIFrameElement;expect(frame.src).toContain('start=23');expect(screen.getByText('Preparando demonstração…')).toBeDefined();fireEvent.click(screen.getByText('Reiniciar trecho'));expect(screen.getByText('Preparando demonstração…')).toBeDefined()});
});
