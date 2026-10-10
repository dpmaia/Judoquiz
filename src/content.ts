import type {Category,Grade,Media,Question,Requirement,Technique} from './domain';
import {makeExpandedContent} from './expandedContent';
import {makeTheoryContent} from './theoryContent';

export const grades:Grade[] = [
  ['branca-cinza','Branca/Cinza',11,['#f8f8f5','#aeb3bb'],7],['cinza','Cinza',10,['#9ca3af'],7],['cinza-azul','Cinza/Azul',9,['#aeb3bb','#477fc3'],7],['azul','Azul',8,['#477fc3'],7],['azul-amarela','Azul/Amarela',7,['#477fc3','#e8c348'],8],['amarela','Amarela',6,['#e8c348'],8],['amarela-laranja','Amarela/Laranja',5,['#e8c348','#ed9243'],8],['laranja','Laranja',4,['#ed9243'],9],['verde','Verde',3,['#5c9b6b'],9],['roxa','Roxa',2,['#8465a4'],10],['marrom','Marrom',1,['#79523c'],10]
].map(([id,name,kyu,colors,page],order)=>({id:id as string,name:name as string,kyu:kyu as number,colors:colors as [string,string?],page:page as number,order,requirements:[]}));

const rows:[string,Category,string,string?][] = [
 ['branca-cinza','rei','Saudação em pé (Ritsu-rei) e ajoelhado (Za-rei).'],
 ['branca-cinza','ukemi','Ushiro-ukemi e Yoko-ukemi na posição deitada.'],
 ['branca-cinza','nage','Uma projeção integrante do 1º Kyô.'],
 ['branca-cinza','osae','Uma técnica de imobilização.'],
 ['branca-cinza','vocabulario','Sensei: professor.'],
 ['cinza','ukemi','Yoko-ukemi agachado e em pé; Mae-mawari-ukemi com rolamento.'],
 ['cinza','nage','Duas projeções integrantes do 1º Kyô.'],
 ['cinza','osae','Duas técnicas de imobilização.'],
 ['cinza','vocabulario','Contar até dez em japonês; Tatame; Judogui.'],
 ['cinza','historia','Criador do Judô: Jigoro Kano.'],
 ['cinza-azul','kumi','Formas de pegar no judogi (Kumi-kata).'],
 ['cinza-azul','ukemi','Três tipos de ukemi em movimento.'],
 ['cinza-azul','nage','Três projeções do 1º Kyô.'],
 ['cinza-azul','osae','Três imobilizações.'],
 ['cinza-azul','vocabulario','Mate, Hajime, Soremade, Sonomama e Kiotsuke.'],
 ['cinza-azul','historia','Primeira escola de judô: Kodokan.'],
 ['azul','fundamentos','Kuzushi, Renraku-waza, viradas e amarração da faixa.'],
 ['azul','nage','Quatro projeções do 1º Kyô.'],['azul','osae','Três imobilizações.'],
 ['azul','vocabulario','Judogi, Shitabaki, Uwagui, Obi e Zoori.'],
 ['azul','historia','Fundação do Kodokan em maio de 1882; origem no Ju-jutsu.'],
 ['azul-amarela','fundamentos','Ordem das faixas, sequências, contragolpe, viradas e Shisei.'],
 ['azul-amarela','nage','Cinco projeções do 1º Kyô.'],['azul-amarela','osae','Quatro imobilizações.'],
 ['azul-amarela','vocabulario','Uchi-komi, Randori, Shiai, Dôjô e Shiai-jô.'],
 ['azul-amarela','historia','Nascimento de Jigoro Kano em 28 de outubro de 1860.'],
 ['amarela','fundamentos','Sequências, contragolpes, viradas, Shintai e Fusegui.'],
 ['amarela','nage','Seis projeções do 1º Kyô.'],['amarela','osae','Cinco imobilizações.'],
 ['amarela','vocabulario','Tori e Uke.'],['amarela','historia','Morte de Jigoro Kano em 4 de maio de 1938.'],
 ['amarela-laranja','fundamentos','Sequências, contragolpes, viradas, Tai-sabaki e Fusegi.'],
 ['amarela-laranja','nage','Todas as projeções do 1º Kyô.'],['amarela-laranja','osae','Seis imobilizações.'],
 ['amarela-laranja','vocabulario','Significado de Judô, Ju e Dô.'],['amarela-laranja','historia','Primeiro Campeonato Brasileiro de Judô em 1954.'],
 ['laranja','fundamentos','Sequências, contragolpes, viradas, fases da técnica e Nogare-kata.'],
 ['laranja','nage','Todas as projeções do 2º Kyô.'],['laranja','osae','Sete imobilizações.'],
 ['laranja','vocabulario','Termos de arbitragem e pontuação listados no programa.'],
 ['laranja','historia','Judô nos Jogos Olímpicos: Tóquio 1964 e Munique 1972, conforme o regulamento.'],
 ['verde','fundamentos','Sequências, contragolpes, viradas, Te-waza do Nage-no-Kata e passagem de guarda.'],
 ['verde','nage','Todas as projeções do 3º Kyô.'],['verde','osae','Oito imobilizações.'],
 ['verde','vocabulario','Termos listados no programa da faixa verde.'],['verde','historia','Primeiro mundial em 1956 e mundiais no Brasil.'],
 ['roxa','fundamentos','Sequências, contragolpes, viradas, Koshi-waza do Nage-no-Kata e classificação.'],
 ['roxa','nage','Todas as projeções do 4º Kyô.'],['roxa','osae','Nove imobilizações.'],['roxa','shime','Duas técnicas de estrangulamento (Shime-waza).'],['roxa','kansetsu','Duas técnicas de chave de cotovelo (Kansetsu-waza).'],
 ['roxa','vocabulario','Termos listados no programa da faixa roxa.'],
 ['marrom','fundamentos','Sequências, contragolpes, viradas, Ashi-waza do Nage-no-Kata, arbitragem e mesa.'],
 ['marrom','nage','Todas as projeções do 5º Kyô.'],['marrom','shime','Quatro técnicas de estrangulamento (Shime-waza).'],['marrom','kansetsu','Quatro técnicas de chave de cotovelo (Kansetsu-waza).'],
 ['marrom','vocabulario','Termos listados no programa da faixa marrom.'],['marrom','historia','História e princípios apresentados no programa da faixa marrom.']
];
export const requirements:Requirement[] = rows.map(([gradeId,category,description],i)=>({id:`r${i+1}`,gradeId,category,description,reference:`FMJ, art. 8º, p. ${grades.find(g=>g.id===gradeId)?.page}`}));
grades.forEach(g=>g.requirements=requirements.filter(r=>r.gradeId===g.id).map(r=>r.id));
const req=(grade:string,category:Category)=>requirements.find(r=>r.gradeId===grade&&r.category===category)!;
const q=(id:string,grade:string,category:Category,prompt:string,answer:string,others:[string,string,string],explanation:string,kind:'text'|'video'|'image'='text',techniqueId?:string,mediaId?:string,imagePath?:string):Question=>({id,introducedAt:grade,requirementId:req(grade,category).id,category,kind,prompt,options:[answer,...others],answer,explanation,reference:req(grade,category).reference,techniqueId,mediaId,imagePath});
const expanded=makeExpandedContent(requirements);

export const media:Media[]=[
 {id:'o-goshi-kodokan',source:'youtube',player:'youtube-iframe',videoId:'yhu1mfy2vJ4',start:5,end:70,mask:{enabled:true,left:'0%',bottom:'5%',width:'34%',height:'16%'}},
 {id:'ushiro-ukemi-kodokan',source:'youtube',player:'youtube-iframe',videoId:'VoktcQAxEPg',start:28,end:55},
 {id:'yoko-ukemi-kodokan',source:'youtube',player:'youtube-iframe',videoId:'VoktcQAxEPg',start:63,end:70},
 {id:'outen-ukemi-kodokan',source:'youtube',player:'youtube-iframe',videoId:'VoktcQAxEPg',start:77,end:89},
 {id:'mae-ukemi-kodokan',source:'youtube',player:'youtube-iframe',videoId:'VoktcQAxEPg',start:96,end:99},
 {id:'mae-mawari-ukemi-kodokan',source:'youtube',player:'youtube-iframe',videoId:'VoktcQAxEPg',start:108,end:135},
 {id:'ai-yotsu-kodokan',source:'youtube',player:'youtube-iframe',videoId:'AdnY_TrL7XE',start:5,end:88,mask:{enabled:true,left:'0%',bottom:'5%',width:'34%',height:'16%'}},
 {id:'kenka-yotsu-kodokan',source:'youtube',player:'youtube-iframe',videoId:'AdnY_TrL7XE',start:95,mask:{enabled:true,left:'0%',bottom:'5%',width:'34%',height:'16%'}},
 ...expanded.media
];
export const techniques:Technique[]=[{id:'o-goshi',name:'O-goshi',aliases:['Ō-goshi'],category:'nage',classification:'Koshi-waza',group:'1º Kyô (associação editorial; não enumerado pela FMJ)',description:'Projeção de quadril.',mediaIds:['o-goshi-kodokan'],reference:'FMJ, art. 8º, p. 7; Judocon, p. 36; vídeo KODOKAN × IJF Academy verificado no canal KODOKAN'},...expanded.techniques];

export const questions:Question[]=[
 q('bc-rei-1','branca-cinza','rei','Qual saudação é mostrada na imagem?','Ritsu-rei',['Za-rei','Yoko-ukemi','Kumi-kata'],'Ritsu-rei é a saudação em pé.','image',undefined,undefined,'/visual-refs/ritsu-rei.jpg'),
 q('bc-rei-2','branca-cinza','rei','Qual saudação é mostrada na imagem?','Za-rei',['Ritsu-rei','Ushiro-ukemi','Osae-waza'],'Za-rei é a saudação ajoelhada.','image',undefined,undefined,'/visual-refs/za-rei.jpg'),
 q('bc-ukemi-1','branca-cinza','ukemi','Qual amortecimento é demonstrado no vídeo?','Ushiro-ukemi',['Yoko-ukemi','Mae-mawari-ukemi','Ritsu-rei'],'Ushiro-ukemi é o amortecimento para trás.','video',undefined,'ushiro-ukemi-kodokan'),
 q('bc-ukemi-2','branca-cinza','ukemi','Qual amortecimento é demonstrado no vídeo?','Yoko-ukemi',['Ushiro-ukemi','Mae-mawari-ukemi','Za-rei'],'Yoko-ukemi é o amortecimento lateral.','video',undefined,'yoko-ukemi-kodokan'),
 q('bc-vocab-1','branca-cinza','vocabulario','O que significa Sensei?','Professor',['Aluno','Árbitro','Adversário'],'Sensei significa professor.'),
 q('bc-video-1','branca-cinza','nage','Qual técnica de projeção é demonstrada?','O-goshi',['Seoi-nage','De-ashi-harai','O-soto-gari'],'O-goshi é uma projeção de quadril. A FMJ menciona o 1º Kyô sem enumerar suas técnicas.','video','o-goshi','o-goshi-kodokan'),
 q('ci-ukemi-2','cinza','ukemi','Qual amortecimento é demonstrado no vídeo?','Mae-mawari-ukemi',['Yoko-ukemi','Ushiro-ukemi','Ritsu-rei'],'O regulamento também registra a grafia Zempokaiten ukemi.','video',undefined,'mae-mawari-ukemi-kodokan'),
 q('ci-vocab-1','cinza','vocabulario','Qual sequência corresponde à contagem de um a cinco em japonês?','Iti, ni, san, shi, go',['Iti, san, ni, shi, go','Ni, iti, san, shi, go','Iti, ni, shi, san, go'],'A sequência segue a grafia usada no regulamento da FMJ.'),
 q('ci-vocab-2','cinza','vocabulario','Qual sequência continua a contagem de seis a dez em japonês?','Roku, shiti, hati, kyû, jû',['Roku, hati, shiti, kyû, jû','Shiti, roku, hati, kyû, jû','Roku, shiti, hati, jû, kyû'],'A sequência segue a grafia usada no regulamento da FMJ.'),
 q('ci-vocab-5','cinza','vocabulario','O que o termo tatame indica?','Área de prática do judô',['Uniforme do judoca','Saudação ajoelhada','Técnica de projeção'],'O regulamento associa tatame ao local de treinamento ou competição.'),
 q('ci-vocab-6','cinza','vocabulario','Qual é o nome do uniforme usado no judô?','Judogui',['Tatame','Dojo','Obi'],'O regulamento usa a grafia judogui.'),
 q('ci-hist-1','cinza','historia','Quem criou o judô?','Jigoro Kano',['Tsunejiro Tomita','Shiro Saigo','Yoshiaki Yamashita'],'Jigoro Kano é o criador do judô.'),
 q('ca-kumi-1','cinza-azul','kumi','Qual configuração de pegada é demonstrada?','Ai-yotsu',['Kenka-yotsu','Kuzushi','Tsukuri'],'Ai-yotsu é a configuração em que os judocas usam a mesma lateralidade.','video',undefined,'ai-yotsu-kodokan'),
 q('ca-kumi-2','cinza-azul','kumi','Qual configuração de pegada é demonstrada?','Kenka-yotsu',['Ai-yotsu','Kuzushi','Tsukuri'],'Kenka-yotsu é a configuração com lateralidades opostas.','video',undefined,'kenka-yotsu-kodokan'),
 ...expanded.questions,
 ...makeTheoryContent(requirements)
];
