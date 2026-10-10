import {grades,questions,requirements} from './content';
import type {Category,Question,QuizConfig,Response,Result} from './domain';
export const shuffle=<T,>(items:T[],random=Math.random):T[]=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
export function eligible(config:QuizConfig):Question[]{
 const grade=grades.find(g=>g.id===config.gradeId);if(!grade)return [];
 const allowed=new Set(grades.filter(g=>config.cumulative?g.order<=grade.order:g.id===grade.id).map(g=>g.id));
 const requirementIds=new Set(requirements.filter(r=>allowed.has(r.gradeId)).map(r=>r.id));
 return questions.filter(q=>allowed.has(q.introducedAt)&&requirementIds.has(q.requirementId)&&(config.mode==='treino'||q.scope!=='supplemental')&&(config.categories.length===0||config.categories.includes(q.category)));
}
export function prepare(config:QuizConfig,random=Math.random):Question[]{return shuffle(eligible(config),random).slice(0,config.count).map(q=>({...q,options:shuffle(q.options,random) as Question['options']}))}
export function score(config:QuizConfig,responses:Response[],date=new Date().toISOString()):Result{const correct=responses.filter(r=>r.correct).length;return{id:`${date}-${Math.random().toString(36).slice(2,8)}`,date,config,responses,correct,wrong:responses.length-correct}}
const key='judo-quiz-results-v1';
export function loadResults():Result[]{try{const raw=localStorage.getItem(key);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[]}catch{return []}}
export function saveResult(result:Result):void{localStorage.setItem(key,JSON.stringify([result,...loadResults()].slice(0,100)))}
export function categoryBreakdown(result:Result):{category:Category;correct:number;total:number}[]{
 const rows=new Map<Category,{correct:number;total:number}>();for(const response of result.responses){const q=questions.find(x=>x.id===response.questionId);if(!q)continue;const row=rows.get(q.category)||{correct:0,total:0};row.total++;if(response.correct)row.correct++;rows.set(q.category,row)}return [...rows].map(([category,row])=>({category,...row}));
}
