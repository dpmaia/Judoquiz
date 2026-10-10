import playlistData from './playlist.json';
import type {Category,Media,Question,Requirement,Technique} from './domain';

type PlaylistEntry={index:number;videoId:string;name:string;seconds:number;kind:'promo'|'overview'|'nage'|'osae'|'escape'|'shime'|'kansetsu';group?:string;gokyo?:number};
const playlist=playlistData as PlaylistEntry[];
const gradeByKyo:Record<number,string>={1:'branca-cinza',2:'laranja',3:'verde',4:'roxa',5:'marrom'};
const firstKyoOrder:Record<string,string>={
 'O-goshi':'branca-cinza','De-ashi-harai':'cinza','Hiza-guruma':'cinza-azul',
 'Sasae-tsurikomi-ashi':'azul','Uki-goshi':'azul-amarela','O-soto-gari':'amarela',
 'O-uchi-gari':'amarela-laranja','Seoi-nage':'amarela-laranja'
};
const osaeGrades=['branca-cinza','cinza','cinza-azul','azul','azul-amarela','amarela','amarela-laranja','laranja','verde','roxa'];
const pageByGrade:Record<string,number>={'branca-cinza':7,cinza:7,'cinza-azul':7,azul:7,'azul-amarela':8,amarela:8,'amarela-laranja':8,laranja:9,verde:9,roxa:10,marrom:10};
const gokyoPages:Record<number,string>={1:'35–36',2:'37–38',3:'39–40',4:'41–42',5:'43–44'};
const mask={enabled:true,left:'0%',bottom:'5%',width:'34%',height:'16%'};
const maskFor=(name:string)=>({...mask,width:`${Math.min(70,Math.max(34,Math.ceil(18+name.length*1.6)))}%`});
const slug=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const clean=(name:string)=>name.replace(/\s+Escapes$/,'').replace(/siho/g,'shiho');
const answerFor=(entry:PlaylistEntry)=>entry.kind==='escape'?`Saída de ${clean(entry.name)}`:entry.name;

export function makeExpandedContent(requirements:Requirement[]):{media:Media[];techniques:Technique[];questions:Question[]}{
 const req=(grade:string,category:Category)=>{
  const found=requirements.find(r=>r.gradeId===grade&&r.category===category);
  if(!found)throw new Error(`Requisito ausente: ${grade}/${category}`);
  return found;
 };
 const media:Media[]=playlist.filter(item=>item.videoId!=='yhu1mfy2vJ4'&&item.kind!=='promo').map(item=>({
  id:`playlist-${item.index}`,source:'youtube',player:'youtube-iframe',videoId:item.videoId,
  start:5,end:Math.max(10,item.seconds-5),mask:maskFor(item.name)
 }));
 const playable=playlist.filter(item=>!['promo','overview'].includes(item.kind));
 const osae=playable.filter(item=>item.kind==='osae');
 const escapes=playable.filter(item=>item.kind==='escape');
 const shime=playable.filter(item=>item.kind==='shime');
 const kansetsu=playable.filter(item=>item.kind==='kansetsu');
 const techniques:Technique[]=[];
 const questions:Question[]=[];
 for(const item of playable){
  if(item.videoId==='yhu1mfy2vJ4')continue; // Já cadastrado no banco inicial.
  let grade:string;
  let category:Category;
  let scope:Question['scope'];
  if(item.kind==='nage'){
   grade=item.gokyo===1?firstKyoOrder[item.name]:item.gokyo?gradeByKyo[item.gokyo]:'marrom';
   category='nage';
   if(!item.gokyo)scope='supplemental';
  }else if(item.kind==='osae'){
   grade=osaeGrades[osae.indexOf(item)];category='osae';
  }else if(item.kind==='escape'){
   grade=escapes.indexOf(item)<5?'laranja':'verde';category='fundamentos';
  }else if(item.kind==='shime'){
   grade=shime.indexOf(item)<6?'roxa':'marrom';category='shime';
   if(item.name==='Do-jime')scope='supplemental';
  }else{
   grade=kansetsu.indexOf(item)<5?'roxa':'marrom';category='kansetsu';
   if(item.name==='Ashi-garami')scope='supplemental';
  }
  const mediaId=`playlist-${item.index}`;
  const techniqueId=`playlist-${slug(item.name)}`;
  const source=`KODOKAN × IJF Academy, playlist, vídeo ${item.index}`;
  const curricular=`FMJ, art. 8º, p. ${pageByGrade[grade]}`;
  const judocon=item.gokyo?`Judocon, pp. ${gokyoPages[item.gokyo]}`:item.kind==='osae'?'Judocon, p. 47':item.kind==='shime'&&item.name!=='Do-jime'?'Judocon, pp. 48–49':item.kind==='kansetsu'?'Judocon, p. 50':item.kind==='nage'&&['Kani-basami','Kawazu-gake'].includes(item.name)?'Judocon, p. 46':'';
  const reference=[scope?'':curricular,judocon,source].filter(Boolean).join('; ');
  techniques.push({id:techniqueId,name:item.name,aliases:[],category,classification:item.group,
   group:item.gokyo?`${item.gokyo}º Kyô`:(scope?'Conteúdo complementar':undefined),
   description:item.kind==='escape'?'Demonstração de saída de imobilização.':'Demonstração técnica da playlist.',
   mediaIds:[mediaId],reference});
  const pool=playable.filter(other=>other.kind===item.kind&&(item.kind!=='nage'||other.gokyo===item.gokyo));
  const place=pool.indexOf(item);
  const others=[1,2,3].map(offset=>answerFor(pool[(place+offset)%pool.length])) as [string,string,string];
  const answer=answerFor(item);
  const prompt=item.kind==='escape'?'De qual imobilização é demonstrada uma saída?':
   item.kind==='osae'?'Qual imobilização é demonstrada?':
   item.kind==='shime'?'Qual técnica de estrangulamento é demonstrada?':
   item.kind==='kansetsu'?'Qual técnica articular é demonstrada?':'Qual técnica de projeção é demonstrada?';
  questions.push({id:`video-playlist-${item.index}`,introducedAt:grade,requirementId:req(grade,category).id,
   category,kind:'video',scope,prompt,options:[answer,...others],answer,
   explanation:`A demonstração da playlist identifica ${answer}. ${scope?['Kani-basami','Kawazu-gake','Ashi-garami'].includes(item.name)?'A apostila Judocon assinala esta técnica como proibida; aparece somente no treino complementar.':'Conteúdo complementar que não integra o simulado FMJ.':'A distribuição dos exemplos por faixa no quiz é editorial.'}`,
   reference,techniqueId,mediaId});
 }
 return {media,techniques,questions};
}
