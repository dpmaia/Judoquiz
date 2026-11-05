import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import App from './App';
import type {QuizConfig} from './domain';

afterEach(()=>{cleanup();vi.restoreAllMocks()});
function showVideo(mode:QuizConfig['mode']){
 vi.spyOn(Math,'random').mockReturnValue(0.5);
 const config:QuizConfig={gradeId:'branca-cinza',count:10,categories:['nage'],cumulative:false,mode};
 const view=render(<MemoryRouter initialEntries={[{pathname:'/quiz',state:config}]}><App/></MemoryRouter>);
 expect(screen.getByTitle('Demonstração da técnica')).toBeDefined();
 return view;
}
describe('cobertura por modo',()=>{
 it('fica fixa no simulado e não oferece controle para desativar',()=>{const view=showVideo('simulado');expect(view.container.querySelector('.name-mask')).not.toBeNull();expect(view.container.querySelector('.title-mask')).toBeNull();expect(screen.queryByText('Ocultar nome da técnica')).toBeNull()});
 it('pode ser desligada somente no treino',()=>{const view=showVideo('treino');const control=screen.getByLabelText('Ocultar nome da técnica');expect(view.container.querySelector('.name-mask')).not.toBeNull();fireEvent.click(control);expect(view.container.querySelector('.name-mask')).toBeNull()});
 it('cria outro iframe ao avançar entre dois vídeos',()=>{vi.spyOn(Math,'random').mockReturnValue(0.5);const config:QuizConfig={gradeId:'cinza-azul',count:10,categories:['kumi'],cumulative:false,mode:'simulado'};render(<MemoryRouter initialEntries={[{pathname:'/quiz',state:config}]}><App/></MemoryRouter>);const first=screen.getByTitle('Demonstração da técnica');expect(screen.getByText('Preparando demonstração…')).toBeDefined();fireEvent.click(screen.getAllByRole('button',{name:/Ai-yotsu|Kenka-yotsu|Kuzushi|Tsukuri/})[0]);fireEvent.click(screen.getByText(/Próxima questão/));const second=screen.getByTitle('Demonstração da técnica');expect(second).not.toBe(first);expect(screen.getByText('Preparando demonstração…')).toBeDefined()});
});
