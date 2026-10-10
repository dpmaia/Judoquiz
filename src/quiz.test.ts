import {beforeEach,describe,expect,it} from 'vitest';
import {grades,media,questions,requirements,techniques} from './content';
import playlist from './playlist.json';
import {eligible,loadResults,prepare,saveResult,score} from './quiz';
import type {QuizConfig} from './domain';
const config:QuizConfig={gradeId:'cinza',count:20,categories:[],cumulative:true,mode:'simulado'};
describe('currículo e simulado',()=>{
 it('inclui questões anteriores apenas no modo cumulativo',()=>{const all=eligible(config);expect(all.some(q=>q.introducedAt==='branca-cinza')).toBe(true);expect(eligible({...config,cumulative:false}).every(q=>q.introducedAt==='cinza')).toBe(true)});
 it('relaciona requisitos à graduação e à fonte',()=>{for(const grade of grades){for(const id of grade.requirements){const r=requirements.find(x=>x.id===id);expect(r?.gradeId).toBe(grade.id);expect(r?.reference).toContain('p.')}}});
 it('mantém quatro alternativas distintas e uma resposta correta',()=>{for(const q of questions){expect(q.options).toHaveLength(4);expect(new Set(q.options).size).toBe(4);expect(q.options.filter(o=>o===q.answer)).toHaveLength(1)}});
 it('mantém IDs únicos e questões próprias para todas as faixas',()=>{expect(questions).toHaveLength(242);const ids=questions.map(q=>q.id);expect(ids.filter((id,index)=>ids.indexOf(id)!==index)).toEqual([]);expect(new Set(media.map(m=>m.id)).size).toBe(media.length);for(const grade of grades){expect(eligible({...config,gradeId:grade.id,cumulative:false}).length).toBeGreaterThan(0)}});
 it('respeita a disponibilidade e aceita questões com e sem vídeo',()=>{const deck=prepare(config,()=>0.4);expect(deck.length).toBe(Math.min(config.count,eligible(config).length));expect(deck.some(q=>q.kind==='video')).toBe(true);expect(deck.some(q=>q.kind==='text')).toBe(true);expect(prepare({...config,gradeId:'marrom',cumulative:false})).toHaveLength(20)});
 it('cobre todas as 100 técnicas e as 10 saídas da playlist sem incluir extras no simulado',()=>{const playable=playlist.filter(item=>!['promo','overview'].includes(item.kind));expect(playable).toHaveLength(110);expect(techniques).toHaveLength(110);for(const item of playable){const related=questions.find(q=>q.mediaId===`playlist-${item.index}`)||questions.find(q=>q.mediaId==='o-goshi-kodokan'&&item.name==='O-goshi');expect(related).toBeDefined();expect(media.some(m=>m.id===related?.mediaId&&m.videoId===item.videoId)).toBe(true)}const exam=eligible({...config,gradeId:'marrom'});expect(exam.every(q=>q.scope!=='supplemental')).toBe(true);expect(eligible({...config,gradeId:'marrom',mode:'treino'}).some(q=>q.scope==='supplemental')).toBe(true)});
 it('mapeia os cinco grupos do Go Kyô com oito projeções cada',()=>{for(let group=1;group<=5;group++)expect(playlist.filter(item=>item.gokyo===group)).toHaveLength(8)});
 it('calcula acertos e erros',()=>{const result=score(config,[{questionId:'a',selected:'x',correct:true},{questionId:'b',selected:'y',correct:false}],'2026-10-10T00:00:00.000Z');expect(result.correct).toBe(1);expect(result.wrong).toBe(1)});
});
describe('histórico local',()=>{beforeEach(()=>localStorage.clear());it('persiste resultados',()=>{const result=score(config,[{questionId:'bc-rei-1',selected:'Ritsu-rei',correct:true}]);saveResult(result);expect(loadResults()[0].id).toBe(result.id)})});
