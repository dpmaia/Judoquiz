import type {Category,Question,Requirement} from './domain';

type Pair=[term:string,meaning:string];
const pages:Record<string,number>={'branca-cinza':7,cinza:7,'cinza-azul':7,azul:7,'azul-amarela':8,amarela:8,'amarela-laranja':9,laranja:9,verde:9,roxa:10,marrom:10};
const slug=(value:string)=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function makeTheoryContent(requirements:Requirement[]):Question[]{
 const out:Question[]=[];
 const req=(grade:string,category:Category)=>{
  const found=requirements.find(item=>item.gradeId===grade&&item.category===category);
  if(!found)throw new Error(`Requisito teórico ausente: ${grade}/${category}`);
  return found;
 };
 function add(grade:string,category:Category,id:string,prompt:string,answer:string,others:[string,string,string],explanation:string,judoconPage?:number){
  out.push({id:`theory-${grade}-${id}`,introducedAt:grade,requirementId:req(grade,category).id,category,kind:'text',
   prompt,options:[answer,...others],answer,explanation,
   reference:`FMJ, art. 8º, p. ${pages[grade]}${judoconPage?`; Judocon, p. ${judoconPage}`:''}`});
 }
 function terms(grade:string,category:Category,pairs:Pair[],judoconPage?:number,prefix='O que significa'){
  if(pairs.length<4)throw new Error(`Conjunto curto: ${grade}`);
  pairs.forEach(([term,meaning],i)=>{
   const others=[1,2,3].map(offset=>pairs[(i+offset)%pairs.length][1]) as [string,string,string];
   add(grade,category,slug(term),`${prefix} ${term}?`,meaning,others,`${term} significa ${meaning.toLowerCase()}.`,judoconPage);
  });
 }

 terms('cinza-azul','vocabulario',[
  ['Mate','Parar'],['Hajime','Começar'],['Soremade','Terminou'],['Sonomama','Não se mova'],['Kiotsuke','Atenção ou posição de sentido']
 ],12);
 add('cinza-azul','historia','primeira-escola','Qual foi a primeira escola de judô?','Kodokan',['Dojô','Budokan','Nippon Budôkan'],'A primeira escola de judô foi o Kodokan.',13);

 terms('azul','vocabulario',[
  ['Shitabaki','Calça do judogi'],['Uwagui','Casaco do judogi'],['Obi','Faixa do judogi'],['Zoori','Chinelo usado pelo judoca']
 ],14);
 terms('azul','fundamentos',[
  ['Kuzushi','Desequilíbrio do oponente'],['Renraku-waza','Sequência de golpes'],['Kumi-kata','Forma de pegar no judogi'],['Osae-komi-waza','Técnica de imobilização']
 ],14);
 add('azul','historia','fundacao-kodokan','Em que mês e ano foi fundado o Kodokan?','Maio de 1882',['Maio de 1860','Outubro de 1882','Maio de 1938'],'O programa da FMJ registra maio de 1882 para a fundação do Kodokan.',14);
 add('azul','historia','origem-judo','De qual arte marcial o judô se desenvolveu?','Ju-jutsu',['Karatê','Sumô','Aikidô'],'O regulamento apresenta o judô como evolução do Ju-jutsu.',14);
 add('azul','fundamentos','teme-perder','Complete o ensinamento: “Quem teme perder…”','…já está vencido.',['…deve evitar o treino.','…vence antes de lutar.','…não precisa aprender.'],'A frase integra os princípios apresentados para a faixa azul.');

 terms('azul-amarela','vocabulario',[
  ['Uchi-komi','Treinamento de entrada das técnicas'],['Randori','Treino livre'],['Shiai','Competição'],['Dôjô','Academia ou local de prática'],['Shiai-jô','Local de competição']
 ],15);
 terms('azul-amarela','fundamentos',[
  ['Shizen hontai','Postura natural básica'],['Migi shizentai','Postura natural à direita'],['Hidari shizentai','Postura natural à esquerda'],
  ['Jigo hontai','Postura defensiva básica'],['Migi jigotai','Postura defensiva à direita'],['Hidari jigotai','Postura defensiva à esquerda']
 ],15,'Qual postura corresponde a');
 add('azul-amarela','vocabulario','kyu','Como se chamam os graus inferiores do judô?','Kyû',['Yudansha','Kodansha','Nage-waza'],'Kyû designa as graduações inferiores no programa da FMJ.',15);
 add('azul-amarela','vocabulario','yudansha','Como são chamados os faixas pretas do 1º ao 5º grau?','Yudansha',['Kyû','Kodansha','Mudansha'],'O programa chama os faixas pretas do 1º ao 5º grau de Yudansha.',15);
 add('azul-amarela','vocabulario','kodansha','Qual termo designa as graduações superiores a partir do 6º grau?','Kodansha',['Kyû','Yudansha','Mudansha'],'Kodansha designa as graduações superiores descritas no programa.',15);
 add('azul-amarela','vocabulario','ordem-faixas','Qual é a ordem das faixas entre a cinza e a amarela no programa da FMJ?','Cinza → Cinza/Azul → Azul → Azul/Amarela → Amarela',['Cinza → Azul → Cinza/Azul → Azul/Amarela → Amarela','Cinza → Cinza/Azul → Azul/Amarela → Azul → Amarela','Cinza → Azul/Amarela → Azul → Cinza/Azul → Amarela'],'Esta é a progressão das graduações básicas descrita no programa da FMJ.');
 add('azul-amarela','historia','nascimento-kano','Quando nasceu Jigoro Kano?','28 de outubro de 1860',['28 de outubro de 1882','4 de maio de 1938','28 de maio de 1860'],'O regulamento registra 28 de outubro de 1860.',15);
 add('azul-amarela','fundamentos','dominar-se','Complete o ensinamento: “Conhecer-se e dominar-se…”','…dominar-se é triunfar.',['…é evitar o randori.','…dispensa a prática.','…impede o progresso.'],'A frase aparece nos princípios da faixa azul/amarela.');

 terms('amarela','vocabulario',[
  ['Tori','Judoca que executa a técnica'],['Uke','Judoca que recebe a técnica'],['Ayumi-ashi','Passadas naturais em todas as direções'],['Tsugui-ashi','Passadas sucessivas']
 ],16);
 add('amarela','historia','morte-kano','Quando morreu Jigoro Kano?','4 de maio de 1938',['28 de outubro de 1860','4 de maio de 1882','28 de maio de 1938'],'A data registrada no programa é 4 de maio de 1938.',16);
 add('amarela','fundamentos','fusegui','O que é Fusegui no contexto do judô?','Defesa',['Projeção de quadril','Saudação em pé','Contagem em japonês'],'O programa pede a execução de defesa com as pernas em Katame-waza.',16);
 add('amarela','fundamentos','aperfeicoar','Complete o ensinamento: “O judoca não se aperfeiçoa para lutar…”','…luta para se aperfeiçoar.',['…luta apenas para vencer.','…evita o treino livre.','…abandona a prática.'],'A frase integra os princípios apresentados para a faixa amarela.',16);

 terms('amarela-laranja','vocabulario',[
  ['Judô','Caminho da suavidade'],['Ju','Suavidade e não resistência'],['Dô','Caminho ou doutrina'],
  ['Tai-sabaki','Movimento rotatório do corpo'],['Seiryoku-zenyô','Melhor uso da energia'],['Jita-kyôei','Prosperidade e benefício mútuo']
 ],17);
 add('amarela-laranja','historia','brasileiro-1954','Em que ano ocorreu o primeiro Campeonato Brasileiro de Judô citado no programa?','1954',['1964','1972','1988'],'O regulamento registra 1954 para o primeiro Campeonato Brasileiro.',17);
 add('amarela-laranja','fundamentos','kaeshi','O que caracteriza Kaeshi-waza?','Uma técnica de contragolpe',['Uma forma de saudação','Uma imobilização parada','Uma contagem em japonês'],'Kaeshi-waza designa contragolpes; a apostila apresenta exemplos.',52);

 terms('laranja','vocabulario',[
  ['Katchi','Vitória'],['Sogo-gachi','Vitória por combinação'],['Hantei','Julgamento'],
  ['Fusen-gatchi','Vitória por ausência do adversário'],['Yusen-gatchi','Vitória por superioridade técnica'],
  ['Yuko','Pontuação inferior ao wazari na terminologia do programa'],['Wazari','Meio ponto na terminologia do programa'],
  ['Ippon','Um ponto na terminologia do programa'],['Wazari-awassete-ippon','Dois wazari que completam um ippon'],
  ['Osae-komi','Imobilização em andamento'],['Toketá','Imobilização desfeita']
 ],17,'No vocabulário do programa da FMJ, o que significa');
 terms('laranja','fundamentos',[
  ['Kuzushi','Desequilíbrio'],['Tsukuri','Preparação da técnica'],['Kake','Execução da técnica'],['Nogare-kata','Escapada de uma técnica de domínio']
 ],19,'Qual conceito corresponde a');
 add('laranja','historia','toquio-1964','Em qual cidade e ano o judô apareceu pela primeira vez nos Jogos Olímpicos?','Tóquio, 1964',['Munique, 1972','Seul, 1988','Rio de Janeiro, 2016'],'O histórico do programa registra a participação do judô em Tóquio, em 1964.');
 add('laranja','fundamentos','humildade','Qual qualidade acompanha a busca constante pela perfeição no princípio apresentado para esta faixa?','Humildade',['Arrogância','Indiferença','Pressa'],'O princípio associa constância e sabedoria à humildade.');

 terms('verde','vocabulario',[
  ['Kan-Geiko','Treinamento de inverno'],['Natsu-Geiko','Treinamento de verão'],['Goshi','Quadril'],['Guruma','Roda'],
  ['Gyaku','Inverso'],['Tokui-waza','Técnica preferida'],['Ude','Braço ou antebraço'],['Jime','Estrangulamento'],
  ['Juji','Cruzado'],['Kami','Superior'],['Nogare kata','Escapada'],['Fusegui','Defesa']
 ],18);
 add('verde','historia','primeiro-mundial','Em que ano ocorreu o primeiro Campeonato Mundial de Judô?','1956',['1954','1964','1972'],'O regulamento registra o primeiro mundial em 1956, no Japão.',19);
 add('verde','historia','mundiais-brasil','Qual sequência contém os anos de mundiais de judô no Brasil citados no programa?','1965, 2007 e 2013',['1954, 1964 e 1972','1956, 1988 e 2013','1965, 1972 e 2007'],'O programa lista 1965, 2007 e 2013, realizados no Rio de Janeiro.',19);
 add('verde','fundamentos','formas-pratica','Quais são as três formas fundamentais de prática do judô?','Randori, Kata e Shiai',['Ukemi, Rei e Kumi-kata','Kuzushi, Tsukuri e Kake','Te-waza, Koshi-waza e Ashi-waza'],'Randori é treino livre, Kata é forma e Shiai é competição.',19);
 add('verde','fundamentos','ignorancia','Qual vitória perdura segundo o princípio apresentado para a faixa verde?','A vitória sobre a própria ignorância',['A vitória por ausência','A vitória por superioridade técnica','A vitória sem treinamento'],'O princípio destaca o aprendizado contínuo.');

 terms('roxa','vocabulario',[
  ['Kakari-Geiko','Treino em que um judoca ataca e o outro se defende'],
  ['Rohaku-Shiai','Competição entre equipes de judogui azul e branco'],
  ['Tandoku-Renshu','Treinamento com parceiro imaginário'],
  ['Yaku-Soku-Geiko','Treino leve sem resistência'],
  ['Nague-Komi','Treino de arremessos'],
  ['Kata','Forma de estudo e treinamento']
 ],19);
 terms('roxa','fundamentos',[
  ['Te-waza','Projeções de braço'],['Koshi-waza','Projeções de quadril'],['Ashi-waza','Projeções de pé ou perna'],
  ['Ma-sutemi-waza','Projeções de sacrifício na linha do corpo'],['Yoko-sutemi-waza','Projeções de sacrifício lateral']
 ],20,'Qual classificação corresponde a');
 add('roxa','fundamentos','tachi-waza','Qual grupo reúne as projeções executadas em pé?','Tachi-waza',['Katame-waza','Yoko-sutemi-waza','Shime-waza'],'Tachi-waza reúne as projeções em pé: Te-waza, Koshi-waza e Ashi-waza.',20);
 add('roxa','fundamentos','sutemi-waza','Como se chamam as projeções que envolvem a mudança do corpo para a posição deitada?','Sutemi-waza',['Tachi-waza','Osae-komi-waza','Atemi-waza'],'Sutemi-waza compreende Ma-sutemi-waza e Yoko-sutemi-waza.',20);
 terms('roxa','fundamentos',[
  ['Osae-komi-waza','Técnicas de imobilização'],['Shime-waza','Técnicas de estrangulamento'],
  ['Kansetsu-waza','Técnicas articulares'],['Atemi-waza','Ataque aos pontos vitais']
 ],20,'Qual classificação corresponde a');
 add('roxa','fundamentos','nage-katame','Qual par distingue projeções das técnicas de domínio no solo?','Nage-waza e Katame-waza',['Rei e Ukemi','Shiai e Randori','Tori e Uke'],'Nage-waza reúne projeções; Katame-waza reúne técnicas de controle e domínio.',20);
 add('roxa','fundamentos','orgulho','Que atitude o princípio apresentado para a faixa roxa recomenda após vencer?','Evitar o orgulho pela vitória',['Desprezar o adversário','Abandonar os treinos','Considerar-se invencível'],'O princípio lembra que o adversário vencido hoje poderá vencer amanhã.');

 terms('marrom','vocabulario',[
  ['Fusen-cho','Vencer sem lutar'],['Go-No-Sen','Contragolpe'],['Hadaka','Nu'],['Jogai','Fora da área'],
  ['Jonai','Dentro da área'],['Joseki','Local das autoridades'],['Kohai','Iniciante'],['Sempai','Mais graduado'],
  ['Mudansha','Portador de graduação Kyû'],['Yudansha','Portador do 1º ao 5º grau de faixa preta'],
  ['Kodansha','Portador de alta graduação'],['Otagai-ni-rei','Saudação mútua'],
  ['Shomen-ni-rei','Saudação às autoridades'],['Sensei-ni-rei','Saudação ao professor']
 ],20);
 add('marrom','historia','samurais','Qual classe guerreira japonesa praticava o Ju-jutsu citado como origem do judô?','Samurais',['Sumotoris','Árbitros','Atletas olímpicos'],'O histórico do programa relaciona o Ju-jutsu aos samurais.',21);
 add('marrom','fundamentos','seiryoku','Qual é a ideia central de Seiryoku-zenyô?','Máxima eficiência com o mínimo de esforço',['Vencer apenas pela força','Evitar qualquer resistência técnica','Competir sem respeitar o adversário'],'O princípio valoriza o uso inteligente da energia.',21);
 add('marrom','fundamentos','jita','Qual é a ideia central de Jita-kyôei?','Bem-estar e benefício mútuo',['Vitória individual a qualquer custo','Treinamento sem parceiro','Apenas a pontuação em competição'],'O princípio relaciona o desenvolvimento pessoal ao benefício dos outros.',21);
 add('marrom','fundamentos','kodansha-conceito','O que se espera de um Kodansha além de alta graduação?','Estudo, ensino e difusão dos princípios do judô',['Somente vitórias em competição','Apenas domínio de uma projeção','Dispensa de treinamento contínuo'],'O regulamento descreve responsabilidade técnica e educacional para o Kodansha.',21);
 return out;
}
