# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Judocas, incluindo o mantenedor do projeto, que estudam por conta própria para exames de graduação. Usam o Judô Quiz no celular e no computador.

## Product Purpose

Praticar teoria e reconhecimento visual de técnicas da graduação pretendida. A prioridade do redesign é ajudar a pessoa a entender onde errou e escolher o que revisar em seguida.

## Operating Context

- O estudo começa pela faixa ou por um tema no treino livre. A pessoa pode incluir conteúdo anterior e selecionar categorias.
- A prática combina enunciados em texto, imagens de saudações e demonstrações em vídeo. Cada resposta recebe feedback imediato e uma referência curricular. Ao concluir, a pessoa pode conferir os acertos por categoria e filtrar os erros.
- O catálogo de requisitos pode ser consultado independentemente do quiz e leva à configuração do simulado da faixa escolhida.

## Capabilities and Constraints

- O banco documentado contém 242 questões para 11 faixas, de branca/cinza a marrom. Os filtros se aplicam a rodadas de 10 ou 20 questões. Quando há menos itens elegíveis, a rodada usa apenas os disponíveis.
- O simulado usa questões vinculadas ao programa curricular da FMJ. O treino livre também pode incluir questões complementares de reconhecimento, com identificação desse escopo.
- Os resultados são guardados no navegador. A consulta ao histórico está desabilitada na interface atual.
- O app usa React, TypeScript e Vite. A compilação para GitHub Pages usa caminho base próprio e navegação por hash.
- A execução local prefere os arquivos da pasta `Videos/` e usa o YouTube quando um arquivo não está disponível. Os players ocultam a busca inicial do trecho e cobrem o nome da técnica quando configurado. A cobertura é fixa no simulado e opcional no treino. A documentação do projeto registra os limites da ocultação e as condições para distribuição.

## Brand Commitments

- Nome do produto: Judô Quiz. A interface usa português do Brasil.
- O Judô Quiz é uma ferramenta independente de estudo e não representa um exame oficial da FMJ. A pontuação informa o desempenho no quiz. A prática presencial continua sendo parte da preparação.

## Evidence on Hand

- `README.md` e `REFERENCIAS_VISUAIS.md` descrevem o currículo, as fontes e seus limites.
- `src/content.ts`, `src/theoryContent.ts` e `src/expandedContent.ts` reúnem faixas, requisitos e questões. `src/playlist.json` registra as demonstrações do Kodokan × IJF Academy.
- `public/visual-refs/` contém as imagens usadas nas perguntas de saudação. O regulamento fornecido da FMJ define o programa cumulativo. A apostila Judocon apoia nomenclatura e explicações técnicas.

## Product Principles

- Mostrar a relação entre faixa, requisito e prática.
- Usar o feedback e o resultado por categoria para orientar a próxima revisão.
- Distinguir conteúdo curricular de conteúdo complementar e contextualizar a pontuação como ferramenta de estudo.

## Accessibility & Inclusion

O fluxo de estudo deve funcionar em telas pequenas e grandes e ser operável por teclado. Faixa, seleção, acerto e erro precisam ser identificáveis por texto, além da cor.
