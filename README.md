# Judô Quiz

MVP local de preparação para exames de graduação de judô. A plataforma é independente e **não representa exame oficial da FMJ**. A pontuação indica apenas desempenho no quiz.

## Iniciar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite. Para verificar: `npm run test` e `npm run build`.

## Preparar publicação no GitHub Pages

O projeto está configurado para o repositório `dpmaia/Judoquiz`, cujo endereço será `https://dpmaia.github.io/Judoquiz/`. A compilação de publicação usa `/Judoquiz/` como caminho base, mantém a navegação por `#` para que as páginas internas funcionem no Pages e ajusta os caminhos das imagens locais. O desenvolvimento local continua usando os endereços normais.

O fluxo em `.github/workflows/deploy-pages.yml` é **manual**: enviar alterações para o GitHub não publica o protótipo automaticamente. Quando o conteúdo e os vídeos estiverem prontos para distribuição:

1. Envie estas alterações para a branch padrão do repositório.
2. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
3. Em **Actions → Publicar no GitHub Pages**, escolha **Run workflow**.

O fluxo instala as dependências a partir de `pnpm-lock.yaml`, roda os testes, compila e publica `dist`. Para conferir a compilação local do Pages, execute `pnpm build:pages`. Isso apenas cria arquivos em `dist`; não publica o site.

## O que está implementado

- 11 faixas, da branca/cinza à marrom, com representação visual e requisitos vinculados ao art. 8º do regulamento.
- Simulado de 10 ou 20 questões, filtros por categoria, conteúdo cumulativo ou apenas da faixa, respostas embaralhadas e aviso de disponibilidade.
- Treino livre, feedback, resultado por categoria e revisão de erros. O histórico fica armazenado neste navegador, mas a aba de resultados anteriores está temporariamente desabilitada.
- Banco de 242 questões para as 11 faixas: 110 demonstrações técnicas da playlist, teoria por graduação, saudações, ukemi e kumi-kata. No modo cumulativo, cada faixa inclui as anteriores. Quando o filtro oferece menos questões que o total solicitado, a interface avisa e usa somente as disponíveis.
- A [playlist Kodokan × IJF Academy](https://www.youtube.com/playlist?list=PLtz539PTepc16H2iu5F3Q3D7_He1EYlIQ) foi catalogada: 100 técnicas, 10 demonstrações de saídas, 8 vídeos de visão geral e 1 abertura. Cada uma das 110 demonstrações técnicas ou saídas tem uma pergunta visual; os oito vídeos de visão geral não são tratados como técnicas individuais.
- As projeções fora dos cinco grupos do Go Kyô e duas técnicas fora das exigências de estrangulamento/chave de cotovelo aparecem **somente no treino complementar**. O simulado usa as técnicas vinculadas aos requisitos da FMJ. A distribuição de exemplos dentro do 1º Kyô e das imobilizações por faixa é editorial, pois o regulamento não nomeia as técnicas exigidas em cada etapa.
- Player em proporção 16:9, com controle para pausar/reiniciar e trechos aproximados de cada vídeo. Cobertura CSS experimental do nome, fixa no simulado quando configurada e opcional no treino.

## Fontes e limites editoriais

O único documento usado para definir o conteúdo curricular é o PDF **Regulamento para Exame e Promoção de Faixas e Graduação Inferior** da FMJ fornecido pelo usuário. A capa indica **2022**; o art. 18º e a assinatura final indicam aprovação em **5 de maio de 2018**. O nome do arquivo não foi usado como identificação da edição.

O art. 8º, p. 6, determina programa cumulativo. Os requisitos das duas primeiras faixas estão na p. 7. Os programas seguintes ocupam as pp. 7–11. Cada requisito e questão no código traz referência de página. Perguntas sobre a estrutura do regulamento, como o número de técnicas exigidas por faixa ou o grupo curricular citado, foram retiradas do quiz; esses dados continuam no catálogo de requisitos.

O regulamento cita projeções por Kyô, mas **não lista nominalmente essas técnicas**. Os 40 nomes dos cinco grupos foram mapeados com a apostila Judocon, pp. 35–44; a atribuição de uma técnica específica a uma faixa inicial do 1º Kyô é editorial e não uma exigência nominal da FMJ. A apostila também fundamenta classificações e explicações, sem substituir a sequência de graduações da FMJ, que é diferente. O regulamento apresenta grafias variáveis e prováveis erros de digitação. As questões sobre contagem conservam as grafias do PDF. Não foram criadas questões sobre passagens ambíguas, como a data `1822` na narrativa da p. 11. O texto chama Tóquio 1964 de participação olímpica não oficial e Munique 1972 de inclusão oficial; a [IJF registra inclusão oficial já para Tóquio 1964](https://www.ijf.org/news/show/tokyo-1964-the-first-chapter). O quiz pergunta apenas sobre a primeira aparição, em 1964.

A apostila Judocon fornece nomes, classificações e explicações de apoio, mas a FMJ define o conteúdo por faixa. Alguns termos de arbitragem do documento são históricos; as perguntas os identificam como vocabulário do programa e não como regras atuais de competição. Os vídeos são demonstrações visuais. A [IJF descreve a série conjunta com o Kodokan](https://www.ijf.org/news/show/kodokan-launched-official-youtube-channel).

## Cadastrar conteúdo

- **Graduação/requisito:** edite `src/content.ts`, mantendo `gradeId`, categoria e referência de página. A interface lê esse catálogo.
- **Técnica:** o manifesto `src/playlist.json` guarda os IDs, nomes, duração e grupos dos vídeos; `src/expandedContent.ts` cria técnica, mídia e pergunta. Não atribua à FMJ um nome de técnica que ela não enumera.
- **Mídia:** inclua um item em `media` com origem `youtube` ou `local`, player, ID/caminho, início e fim. Verifique o ID e o título no canal original antes de associar. Para arquivo próprio ou licenciado, use `source: 'local'`, `player: 'html-video'` e `path` em `public/`.
- **Questão:** as perguntas teóricas adicionais estão em `src/theoryContent.ts`. Cada item precisa de quatro opções diferentes, uma única resposta e referência. Para reconhecimento visual, informe `mediaId` para vídeo ou `imagePath` para imagem; associe `techniqueId` quando houver técnica cadastrada. Use `scope: 'supplemental'` para material do treino que não deve entrar no simulado FMJ.

Esses arquivos locais formam o banco inicial. A lógica de seleção em `src/quiz.ts` é separada da interface, permitindo substituir o catálogo por uma API ou PostgreSQL/Supabase no futuro.

## Pendências e uso privado

Todas as faixas têm questões próprias, mas o quiz não substitui a demonstração física exigida no exame. O levantamento atualizado está em [REFERENCIAS_VISUAIS.md](REFERENCIAS_VISUAIS.md). A cobertura teórica e o mapeamento editorial de técnicas devem ser revisados por um professor da FMJ antes de apresentar o conteúdo como preparação validada. Os vídeos de técnicas proibidas assinaladas pela Judocon entram apenas no treino complementar de reconhecimento, sem instrução de execução.

A sobreposição CSS ao player do YouTube é um **experimento temporário apenas para uso local e privado**. No simulado, ela permanece ligada quando configurada para o vídeo; no treino, pode ser ligada ou desligada. O iframe não recebe mouse, teclado ou tela cheia; use os botões próprios para pausar e reiniciar. O YouTube exibe o título por alguns segundos ao iniciar e ao buscar outro ponto mesmo sem interação do mouse. Por isso, **todos os vídeos do YouTube** mostram uma breve tela de preparação enquanto o player busca o trecho, revelando-o somente a partir do instante configurado. Cada troca de questão cria um novo player, evitando reaproveitar um iframe já encerrado. A repetição é controlada pela API do YouTube antes do fim do trecho, sem usar o loop nativo que voltava ao início visível. A sobreposição pode contrariar as políticas do YouTube e não garante ocultação completa por todas as interfaces ou recursos de acessibilidade do player. Antes de distribuir, publicar ou usar versões editadas das demonstrações, revise licenças e obtenha as autorizações necessárias. Não há download nem extração de vídeos. O projeto não deve ser publicado ou implantado com essa configuração experimental.

Para continuar: revisar as questões com um professor de judô, ajustar demonstrações que revelem o nome apesar da máscara e substituir o player experimental por vídeos próprios ou licenciados antes de preparar uma versão distribuível.
